<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use App\Mail\UserRegisteredMail;
class UserRegisteredMailController extends Controller
{
    public function UserRegisteredMail(){
        $to = "srijalpudasaini89@gmail.com";
        $username = "sjdlfjalsfjdlj";
        $password = "jdlsfjlajslgj";
        Mail::to($to)->send(new UserRegisteredMail($username, $password));
    }
}
