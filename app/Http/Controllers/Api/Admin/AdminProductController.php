<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreProductRequest;
use App\Http\Requests\Admin\UpdateProductRequest;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\Response;

class AdminProductController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        return ProductResource::collection(
            Product::query()->with('category')->orderBy('display_order')->get()
        );
    }

    public function show(Product $product): JsonResponse
    {
        return response()->json([
            'product' => new ProductResource($product->load('category')),
        ]);
    }

    public function store(StoreProductRequest $request): JsonResponse
    {
        $product = Product::query()->create($this->payload($request));

        return response()->json([
            'message' => 'Produit créé avec succès.',
            'product' => new ProductResource($product->load('category')),
        ], Response::HTTP_CREATED);
    }

    public function update(UpdateProductRequest $request, Product $product): JsonResponse
    {
        $product->update($this->payload($request, $product));

        return response()->json([
            'message' => 'Produit mis à jour.',
            'product' => new ProductResource($product->fresh()->load('category')),
        ]);
    }

    public function destroy(Product $product): JsonResponse
    {
        if ($product->image_path) {
            Storage::disk('public')->delete($product->image_path);
        }

        $product->delete();

        return response()->json([
            'message' => 'Produit supprimé.',
        ]);
    }

    public function toggleAvailability(Product $product): JsonResponse
    {
        $product->update([
            'is_available' => ! $product->is_available,
        ]);

        return response()->json([
            'message' => 'Disponibilité mise à jour.',
            'product' => new ProductResource($product->fresh()->load('category')),
        ]);
    }

    private function payload(Request $request, ?Product $product = null): array
    {
        $data = $request->validated();

        if ($request->hasFile('image_upload')) {
            if ($product?->image_path) {
                Storage::disk('public')->delete($product->image_path);
            }

            $data['image_path'] = $request->file('image_upload')->store('products', 'public');
            $data['image_url'] = null;
        } elseif (! empty($data['image_url'])) {
            if ($product?->image_path) {
                Storage::disk('public')->delete($product->image_path);
            }

            $data['image_path'] = null;
        } else {
            $data['image_url'] = $product?->image_url;
            $data['image_path'] = $product?->image_path;
        }

        unset($data['image_upload']);

        return $data;
    }
}
