<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property string $path
 * @property string $name
 * @property int $memory_game_id
 */
class Image extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'name', 'path'
    ];

    public function memorygame(): BelongsTo
    {
        return $this->belongsTo('memorygame');
    }
}
