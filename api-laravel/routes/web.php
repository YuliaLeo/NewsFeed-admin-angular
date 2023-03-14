<?php

use App\Http\Controllers\ArticleController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
*/

Route::get('/', function () {
    return view('welcome');
});

Route::get('/article/{id}', [ArticleController::class, 'get']);
Route::get('/articles', [ArticleController::class, 'getAll']);

/*Route::get('/a/c', function (){
    return 'fdsfsdfsf';
});*/
