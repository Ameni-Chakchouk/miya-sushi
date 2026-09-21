<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class StoreCategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $slug = $this->filled('slug') ? $this->input('slug') : $this->input('name');

        $this->merge([
            'slug' => Str::slug((string) $slug),
            'display_order' => $this->input('display_order', 0),
        ]);
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', 'unique:categories,slug'],
            'display_order' => ['nullable', 'integer', 'min:0'],
        ];
    }
}
