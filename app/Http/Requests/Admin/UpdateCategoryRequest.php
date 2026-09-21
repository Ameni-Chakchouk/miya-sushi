<?php

namespace App\Http\Requests\Admin;

class UpdateCategoryRequest extends StoreCategoryRequest
{
    public function rules(): array
    {
        $categoryId = $this->route('category')->id;

        return [
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', 'unique:categories,slug,'.$categoryId],
            'display_order' => ['nullable', 'integer', 'min:0'],
        ];
    }
}
