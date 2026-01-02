<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class RequireAdmin
{
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();

        if (! $user || $user->role !== 'admin') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        // Enforce Sanctum token ability for API tokens
        if (method_exists($user, 'tokenCan') && ! $user->tokenCan('admin')) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        return $next($request);
    }
}
