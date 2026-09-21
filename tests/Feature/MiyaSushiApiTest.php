<?php

namespace Tests\Feature;

use App\Enums\DeliveryType;
use App\Enums\OrderStatus;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use Database\Seeders\AdminUserSeeder;
use Database\Seeders\CategorySeeder;
use Database\Seeders\DemoClientSeeder;
use Database\Seeders\ProductSeeder;
use Database\Seeders\RestaurantSettingSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class MiyaSushiApiTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;

    protected User $client;

    protected Product $firstProduct;

    protected Product $secondProduct;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed([
            RestaurantSettingSeeder::class,
            CategorySeeder::class,
            ProductSeeder::class,
            AdminUserSeeder::class,
            DemoClientSeeder::class,
        ]);

        $this->admin = User::query()->where('email', 'admin@gmail.com')->firstOrFail();
        $this->client = User::query()->where('email', 'client@gmail.com')->firstOrFail();
        $this->firstProduct = Product::query()->orderBy('id')->firstOrFail();
        $this->secondProduct = Product::query()->orderBy('id')->skip(1)->firstOrFail();
    }

    public function test_client_can_register(): void
    {
        $response = $this->postJson('/api/register', [
            'name' => 'Nouveau Client',
            'email' => 'nouveau@example.com',
            'phone' => '0601020304',
            'address' => '10 rue Sakura, Lyon',
            'password' => 'motdepasse123',
            'password_confirmation' => 'motdepasse123',
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath('user.email', 'nouveau@example.com')
            ->assertJsonPath('user.role', 'client');

        $this->assertDatabaseHas('users', [
            'email' => 'nouveau@example.com',
            'role' => 'client',
        ]);
    }

    public function test_client_can_login(): void
    {
        $response = $this->postJson('/api/login', [
            'email' => 'client@gmail.com',
            'password' => '12345678',
        ]);

        $response
            ->assertOk()
            ->assertJsonPath('user.email', 'client@gmail.com')
            ->assertJsonPath('user.role', 'client');
    }

    public function test_admin_can_login(): void
    {
        $response = $this->postJson('/api/login', [
            'email' => 'admin@gmail.com',
            'password' => '123',
        ]);

        $response
            ->assertOk()
            ->assertJsonPath('user.email', 'admin@gmail.com')
            ->assertJsonPath('user.role', 'admin');
    }

    public function test_public_can_list_products(): void
    {
        $response = $this->getJson('/api/products');

        $response
            ->assertOk()
            ->assertJsonCount(9, 'data')
            ->assertJsonFragment(['name' => 'California Roll']);
    }

    public function test_client_can_create_order(): void
    {
        Sanctum::actingAs($this->client);

        $response = $this->postJson('/api/orders', [
            'delivery_type' => 'delivery',
            'delivery_address' => '12 avenue du Marché, Paris',
            'comments' => 'No wasabi please',
            'items' => [
                ['product_id' => $this->firstProduct->id, 'quantity' => 2],
                ['product_id' => $this->secondProduct->id, 'quantity' => 1],
            ],
        ]);

        $expectedSubtotal = round((float) $this->firstProduct->price * 2 + (float) $this->secondProduct->price, 2);

        $response
            ->assertCreated()
            ->assertJsonPath('order.delivery_type', 'delivery');

        $this->assertSame($expectedSubtotal, (float) $response->json('order.subtotal'));
        $this->assertSame($expectedSubtotal, (float) $response->json('order.total'));

        $this->assertDatabaseCount('orders', 1);
        $this->assertDatabaseCount('order_items', 2);
    }

    public function test_client_cannot_create_order_with_fake_price(): void
    {
        Sanctum::actingAs($this->client);

        $response = $this->postJson('/api/orders', [
            'delivery_type' => 'takeaway',
            'comments' => 'Fake pricing attempt',
            'total' => 0.01,
            'items' => [
                ['product_id' => $this->firstProduct->id, 'quantity' => 2, 'price' => 0.01],
            ],
        ]);

        $expectedTotal = round((float) $this->firstProduct->price * 2, 2);

        $response
            ->assertCreated();

        $this->assertSame($expectedTotal, (float) $response->json('order.total'));

        $this->assertDatabaseHas('orders', [
            'user_id' => $this->client->id,
            'total' => $expectedTotal,
        ]);
    }

    public function test_client_cannot_see_another_clients_order(): void
    {
        $anotherClient = User::factory()->create();
        $order = Order::factory()->create([
            'user_id' => $anotherClient->id,
            'status' => OrderStatus::PENDING,
            'delivery_type' => DeliveryType::DELIVERY,
        ]);

        OrderItem::factory()->create([
            'order_id' => $order->id,
            'product_id' => $this->firstProduct->id,
            'product_name' => $this->firstProduct->name,
            'product_price' => $this->firstProduct->price,
            'quantity' => 1,
            'line_total' => $this->firstProduct->price,
        ]);

        Sanctum::actingAs($this->client);

        $this->getJson("/api/orders/{$order->id}")
            ->assertForbidden();
    }

    public function test_admin_can_list_all_orders(): void
    {
        Order::factory()->count(2)->create([
            'user_id' => $this->client->id,
        ])->each(function (Order $order) {
            OrderItem::factory()->create([
                'order_id' => $order->id,
                'product_id' => $this->firstProduct->id,
                'product_name' => $this->firstProduct->name,
                'product_price' => $this->firstProduct->price,
                'quantity' => 1,
                'line_total' => $this->firstProduct->price,
            ]);
        });

        Sanctum::actingAs($this->admin);

        $this->getJson('/api/admin/orders')
            ->assertOk()
            ->assertJsonCount(2, 'data');
    }

    public function test_admin_can_accept_order(): void
    {
        $order = Order::factory()->create([
            'user_id' => $this->client->id,
            'status' => OrderStatus::PENDING,
        ]);

        Sanctum::actingAs($this->admin);

        $this->patchJson("/api/admin/orders/{$order->id}/accept")
            ->assertOk()
            ->assertJsonPath('order.status', 'accepted');

        $this->assertDatabaseHas('orders', [
            'id' => $order->id,
            'status' => 'accepted',
        ]);
    }

    public function test_admin_can_reject_order(): void
    {
        $order = Order::factory()->create([
            'user_id' => $this->client->id,
            'status' => OrderStatus::PENDING,
        ]);

        Sanctum::actingAs($this->admin);

        $this->patchJson("/api/admin/orders/{$order->id}/reject")
            ->assertOk()
            ->assertJsonPath('order.status', 'rejected');

        $this->assertDatabaseHas('orders', [
            'id' => $order->id,
            'status' => 'rejected',
        ]);
    }

    public function test_non_admin_cannot_access_admin_routes(): void
    {
        Sanctum::actingAs($this->client);

        $this->getJson('/api/admin/dashboard')
            ->assertForbidden();
    }

    public function test_admin_can_read_product_sales_stats(): void
    {
        $accepted = Order::factory()->create([
            'user_id' => $this->client->id,
            'status' => OrderStatus::ACCEPTED,
        ]);

        OrderItem::factory()->create([
            'order_id' => $accepted->id,
            'product_id' => $this->firstProduct->id,
            'product_name' => $this->firstProduct->name,
            'product_price' => $this->firstProduct->price,
            'quantity' => 3,
            'line_total' => $this->firstProduct->price * 3,
        ]);

        // Une commande refusee ne doit jamais compter dans les ventes.
        $rejected = Order::factory()->create([
            'user_id' => $this->client->id,
            'status' => OrderStatus::REJECTED,
        ]);

        OrderItem::factory()->create([
            'order_id' => $rejected->id,
            'product_id' => $this->secondProduct->id,
            'product_name' => $this->secondProduct->name,
            'product_price' => $this->secondProduct->price,
            'quantity' => 7,
            'line_total' => $this->secondProduct->price * 7,
        ]);

        Sanctum::actingAs($this->admin);

        $response = $this->getJson('/api/admin/stats/product-sales')
            ->assertOk()
            ->assertJsonCount(12, 'months')
            ->assertJsonCount(1, 'products')
            ->assertJsonPath('products.0.name', $this->firstProduct->name)
            ->assertJsonPath('products.0.total_quantity', 3)
            ->assertJsonPath('all_products.total_quantity', 3);

        $monthly = $response->json('products.0.monthly');

        $this->assertCount(12, $monthly);
        $this->assertSame(3, $monthly[11], 'La vente du mois courant doit tomber sur le dernier mois.');
    }

    public function test_non_admin_cannot_read_product_sales_stats(): void
    {
        Sanctum::actingAs($this->client);

        $this->getJson('/api/admin/stats/product-sales')
            ->assertForbidden();
    }
}
