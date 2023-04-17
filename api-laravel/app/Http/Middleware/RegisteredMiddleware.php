<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Cookie\Middleware\EncryptCookies as Middleware;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RegisteredMiddleware extends Middleware
{
    public function handle($request, Closure $next, ...$id)
    {
        // для функции in_array всегда используй strict сравнение, чтобы не было неявных приведений
        if ($request->user() && $request->user()->hasRole('admin') && in_array($request->user()->id, $id)) {
            return $next($request);
        } else { // else тут лишний
            return response()->json(['error' => 'Forbidden'], Response::HTTP_FORBIDDEN);
        }
    }
}
