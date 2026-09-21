<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'category_id' => $this->category_id,
            'category' => $this->whenLoaded('category', fn () => new CategoryResource($this->category)),
            'category_slug' => $this->whenLoaded('category', fn () => $this->category->slug),
            'name' => $this->name,
            'description' => $this->description,
            'price' => (float) $this->price,
            'image_url' => $this->image_url,
            'image_path' => $this->image_path,
            'image_full_url' => $this->image_path ? Storage::disk('public')->url($this->image_path) : $this->image_url,
            'is_new' => (bool) $this->is_new,
            'is_available' => (bool) $this->is_available,
            'display_order' => $this->display_order,
        ];
    }
}
