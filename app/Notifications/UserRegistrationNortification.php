<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class UserRegistrationNortification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $username;
    protected $password;

    /**
     * Create a new notification instance.
     */
    public function __construct(string $username, string $password)
    {
        $this->username = $username;
        $this->password = $password;
    }

    /**
     * Get the notification's delivery channels.
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
                    ->subject('Your Account Credentials')
                    ->greeting('Hello ' . $notifiable->name . '!')
                    ->line('Your account has been created successfully.')
                    ->line('Please find your credentials below:')
                    ->line('Username: ' . $this->username)
                    ->line('Password: ' . $this->password)
                    ->line('Please change your password after your first login for security reasons.')
                    ->action('Login Now', url('/login'));
    }

    /**
     * Get the array representation of the notification.
     */
    public function toArray(object $notifiable): array
    {
        return [
            //
        ];
    }
}