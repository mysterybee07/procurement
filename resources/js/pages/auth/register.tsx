import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';

type RegisterForm = {    
    vendor_name: string;
    address: string;
    registration_number: string;
    pan_number: string;
    email: string;
    phone: string;  
};

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm<Required<RegisterForm>>({
        vendor_name: '',
        address: '',
        registration_number: '',
        pan_number: '',
        email: '',
        phone: '',  
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('register'), {
        });
    };

    return (
        <AuthLayout title="Create an account" description="Enter your details below to create your account">
            <Head title="Register" />
            <form className="flex flex-col gap-6" onSubmit={submit}>
                <div className="grid gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="vendor_name">Vendor Name</Label>
                        <Input
                            id="vendor_name"
                            type="text"
                            required
                            autoFocus
                            tabIndex={1}
                            autoComplete="vendor_name"
                            value={data.vendor_name}
                            onChange={(e) => setData('vendor_name', e.target.value)}
                            disabled={processing}
                            placeholder="Full vendor name"
                        />
                        <InputError message={errors.vendor_name} className="mt-2" />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="email">Email address</Label>
                        <Input
                            id="email"
                            type="email"
                            required
                            tabIndex={2}
                            autoComplete="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            disabled={processing}
                            placeholder="email@example.com"
                        />
                        <InputError message={errors.email} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="address">Address</Label>
                        <Input
                            id="address"
                            type="text"
                            required
                            tabIndex={3}
                            value={data.address}
                            onChange={(e) => setData('address', e.target.value)}
                            disabled={processing}
                            placeholder="Your address"
                        />
                        <InputError message={errors.address} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                            id="phone"
                            type="text" // Using text for phone input to handle various formats
                            required
                            tabIndex={4}
                            value={data.phone}
                            onChange={(e) => setData('phone', e.target.value)}
                            disabled={processing}
                            placeholder="Your phone number"
                            pattern="\d{10}" // Assuming a 10-digit phone number format
                        />
                        <InputError message={errors.phone} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="registration_number">Registration Number</Label>
                        <Input
                            id="registration_number"
                            type="text"
                            required
                            tabIndex={5}
                            value={data.registration_number}
                            onChange={(e) => setData('registration_number', e.target.value)}
                            disabled={processing}
                            placeholder="Your registration number"
                        />
                        <InputError message={errors.registration_number} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="pan_number">PAN Number</Label>
                        <Input
                            id="pan_number"
                            type="text"
                            required
                            tabIndex={6}
                            value={data.pan_number}
                            onChange={(e) => setData('pan_number', e.target.value)}
                            disabled={processing}
                            placeholder="Your PAN number"
                        />
                        <InputError message={errors.pan_number} />
                    </div>

                    <Button type="submit" className="mt-2 w-full" tabIndex={7} disabled={processing}>
                        {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        Create account
                    </Button>
                </div>

                <div className="text-muted-foreground text-center text-sm">
                    Already have an account?{' '}
                    <TextLink href={route('login')} tabIndex={8}>
                        Log in
                    </TextLink>
                </div>
            </form>
        </AuthLayout>
    );
}
