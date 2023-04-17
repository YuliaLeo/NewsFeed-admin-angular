<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\DbModels\User;

class UsersTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run(): void
    {
        User::factory(10)->create();
    }
}
