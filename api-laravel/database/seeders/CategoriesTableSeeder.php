<?php

namespace Database\Seeders;
use Illuminate\Database\Seeder;
use App\DbModels\Category;
class CategoriesTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run(): void
    {
        Category::factory(10)->create();
    }
}
