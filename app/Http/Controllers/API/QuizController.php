<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Game;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Models\Quiz;
use App\Http\Resources\Quiz as QuizResource;

class QuizController extends Controller
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
            'questions.*.title' => 'required|string',
            'questions.*.answers' => 'required|array|max:5',
            'questions.*.answers.*' => 'required|string|max:31',
        ]);
        $game = new Game();
        $game->name = $request->name;
        $game->layout = $request->layout;
        $game->user_id = $request->user_id;
        $game->client_id = $request->client_id;
        $game->origin = $request->origin;
        $game->game_type_id = 4;
        $game->save();
        $quiz = new Quiz();
        $quiz->questions = serialize($request->questions);
        $quiz->game_id = $game->id;
        $quiz->save();
        return response()->json(new QuizResource($quiz), 201);
    }

    /**
     * Display the specified resource.
     *
     * @param  Quiz $quiz
     * @return JsonResponse
     */
    public function show(Quiz $quiz): JsonResponse
    {
        return response()->json(new QuizResource($quiz));
    }

    /**
     * Update the specified resource in storage.
     *
     * @param Request $request
     * @param  Quiz  $quiz
     * @return JsonResponse
     */
    public function update(Request $request, Quiz $quiz): JsonResponse
    {
        $input = $request->all();
        $edited = false;
        foreach ($input as $attr=>$value) {
            if (in_array($attr, array_keys($quiz->getAttributes()))) {
                $edited = true;
                $quiz->$attr = $value;
            }
        }
        if ($edited) {
            $quiz->save();
            return response()->json(new QuizResource($quiz));
        }
        return response()->json(["Bad request" => "Invalid request"], 400);
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
