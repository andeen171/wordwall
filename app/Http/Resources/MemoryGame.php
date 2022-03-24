<?php

namespace App\Http\Resources;

use Carbon\Carbon;
use DateTime;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use JetBrains\PhpStorm\ArrayShape;
use App\Models\Image;
use Illuminate\Support\Facades\Storage;

/**
 * @property int $id
 * @property string $slug
 * @property string $name
 * @property int $layout
 * @property string $grid
 * @property datetime $approved_at
 * @property datetime $created_at
 * @property datetime $updated_at
 */
class MemoryGame extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  Request  $request
     * @return array
     */
    #[ArrayShape(['slug' => "string", 'name' => "string", 'layout' => "int", 'images' => "string[]", 'grid' => "int[]", 'approved_at' => "datetime", 'created_at' => "datetime", 'updated_at' => "datetime"])]
    public function toArray($request): array
    {
        $images = Image::all()->where('memory_game_id', $this->id);
        $temp_urls = [];
        foreach($images as $image){
            // $expires = Carbon::now()->addMinutes(15);
            // $config = config('filesystems.disks.s3');
            // $uri = $image->path."/".$image->name;
            // $request = "GET\n\n\n$expires->timestamp\n/{$config['bucket']}/$uri";
            // $signature = urlencode(base64_encode(hash_hmac('sha1', $request, $config['secret'], true)));
            // $temp_urls[] = "{$config['endpoint']}{$config['bucket']}/$uri?AWSAccessKeyId={$config['key']}&Expires=$expires->timestamp&Signature=$signature";
            // $temp_urls[] = Storage::disk('s3')->temporaryUrl($image->path."/".$image->name, now()->addMinutes(10));
            $temp_urls[] = Storage::disk('s3')->url($image->path."/".$image->name);
        }
        return [
            'slug' => $this->slug,
            'name' => $this->name,
            'layout' => $this->layout,
            'images' => $temp_urls,
            'grid' => unserialize($this->grid, [false]),
            'approved_at' => $this->approved_at,
            'created_at' => $this->created_at->format('d/m/Y H:i:s'),
            'updated_at' => $this->updated_at->format('d/m/Y H:i:s'),
        ];
    }
}
