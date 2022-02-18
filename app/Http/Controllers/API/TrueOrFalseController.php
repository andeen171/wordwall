<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Game;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Models\TrueOrFalse;
use App\Http\Resources\TrueOrFalse as TrueOrFalseResource;

class TrueOrFalseController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return JsonResponse
     */
    public function index(): JsonResponse
    {
        return response()->json([''], 404);
    }


    /**
     * Store a newly created resource in storage.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'layout' => 'required|integer|max:10',
            'questions' => 'required|array|max:10',
            'questions.*.title' => 'required|string|max:240',
            'questions.*.answer' => 'required|boolean'
        ]);
        $game = new Game();
        $game->name = $request->name;
        $game->layout = $request->layout;
        $game->user_id = $request->user_id;
        $game->client_id = $request->client_id;
        $game->origin = $request->origin;
        $game->game_type_id = 5;
        $game->save();
        $true_or_false = new TrueOrFalse();
        $true_or_false->questions = serialize($request->questions);
        $true_or_false->game_id = $game->id;
        $true_or_false->save();

        return response()->json(new TrueOrFalseResource($true_or_false), 201);
    }

    /**
     * Display the specified resource.
     *
     * @param  TrueOrFalse $trueorfalse
     * @return JsonResponse
     */
    public function show(TrueOrFalse $trueorfalse): JsonResponse
    {
        return response()->json(new TrueOrFalseResource($trueorfalse));
    }

    /**
     * Update the specified resource in storage.
     *
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function update(Request $request, int $id): JsonResponse
    {
        return response()->json([''], 404);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param int $id
     * @return JsonResponse
     */
    public function destroy(int $id): JsonResponse
    {
        return response()->json([''], 404);
    }
}
