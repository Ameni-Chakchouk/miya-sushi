<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function __invoke(Request $request): AnonymousResourceCollection
    {
        $products = Product::query()
            ->with('category')
            ->where('is_available', true)
            ->when(
                $request->filled('category'),
                fn ($query) => $query->whereHas('category', fn ($categoryQuery) => $categoryQuery->where('slug', $request->string('category')->toString()))
            )
            ->orderBy('display_order')
            ->get();

        return ProductResource::collection($products);
    }
}
