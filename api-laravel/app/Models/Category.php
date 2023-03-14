<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Category extends Model {
    use SoftDeletes;

    protected $table = 'categories';
    protected $primaryKey = 'category_id';

    protected $fillable = [
        'category_id',
        'name',
    ];

    protected $visible = [
        'category_id',
        'name',
    ];
}
