<?php

namespace App\Http\Requests\Admin;

class UpdateProductRequest extends StoreProductRequest
{
    public function rules(): array
    {
        $productId = $this->route('product')->id;

        return [
            'category_id' => ['required', 'integer', 'exists:categories,id'],
            'name' => ['required', 'string', 'max:255', 'unique:products,name,'.$productId],
            'description' => ['required', 'string', 'max:1000'],
            'price' => ['required', 'numeric', 'min:0'],
            'image_url' => ['nullable', 'url', 'max:2048'],
            'image_upload' => ['nullable', 'file', 'image', 'max:4096'],
            'is_new' => ['required', 'boolean'],
            'is_available' => ['required', 'boolean'],
            'display_order' => ['nullable', 'integer', 'min:0'],
        ];
    }
}
