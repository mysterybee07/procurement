import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { BookOpen, Folder, LayoutGrid } from 'lucide-react';
import AppLogo from './app-logo';

// Define the navigation items with required permissions
const mainNavItems: (NavItem & { permission?: string, vendorOnly?: boolean })[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Users',
        href: '/users',
        icon: LayoutGrid,
        permission: 'view users'
    },
    {
        title: 'Roles',
        href: '/roles',
        icon: LayoutGrid,
        permission: 'view roles'
    },
    // {
    //     title: 'Permissions',
    //     href: '/permissions',
    //     icon: LayoutGrid,
    //     permission: 'view permissions'
    // },
    {
        title: 'Product Category',
        href: '/categories',
        icon: LayoutGrid,
        permission: 'view categories'
    },
    {
        title: 'Products',
        href: '/products',
        icon: LayoutGrid,
        permission: 'view products'
    },
    {
        title: 'Requisition',
        href: '/requisitions',
        icon: LayoutGrid,
        permission: 'view requisitions'
    },
    {
        title: 'Document',
        href: '/documents',
        icon: LayoutGrid,
        permission: 'view documents'
    },
    {
        title: 'EOI',
        href: '/eois',
        icon: LayoutGrid,
        permission: 'view eois'
    },
    {
        title: 'Vendors',
        href: '/vendors',
        icon: LayoutGrid,
        permission: 'view vendors'
    },
    {
        title: 'Open EOIs',
        href: '/vendor/eois',
        icon: LayoutGrid,
        vendorOnly: true
    },
    
];

// export function AppSidebar() {
//     const { auth } = usePage().props as any;
//     const user = auth?.user;
    
//     const filteredNavItems = mainNavItems.filter(item => {

//         if (item.vendorOnly) {
//             // Only show for vendors
//             return user?.is_vendor === true;
//         }

//         if (!item.permission) return true;
        
//         return user?.permissions?.includes(item.permission) || 
//                user?.roles?.some((role: any) => 
//                    role.permissions?.includes(item.permission)
//                );
//     });

//     return (
//         <Sidebar collapsible="icon" variant="inset">
//             <SidebarHeader>
//                 <SidebarMenu>
//                     <SidebarMenuItem>
//                         <SidebarMenuButton size="lg" asChild>
//                             <Link href="/dashboard" prefetch>
//                                 <AppLogo />
//                             </Link>
//                         </SidebarMenuButton>
//                     </SidebarMenuItem>
//                 </SidebarMenu>
//             </SidebarHeader>

//             <SidebarContent>
//                 <NavMain items={filteredNavItems} />
//             </SidebarContent>

//             <SidebarFooter>
//                 <NavUser />
//             </SidebarFooter>
//         </Sidebar>
//     );
// }

export function AppSidebar() {
    const { auth } = usePage().props as any;
    const user = auth?.user;
    
    const filteredNavItems = mainNavItems.filter(item => {
        // Super Admins do not see vendor-only items
        if (user?.is_super_admin) {
            if (item.vendorOnly) {
                return false; // Skip vendor-only items for Super Admin
            }
            return true; // Super Admin sees everything else
        }

        // If it's a vendor-only route
        if (item.vendorOnly) {
            return user?.is_vendor === true;
        }

        // For non-vendor-only routes, check permissions
        if (item.permission) {
            return user?.permissions?.includes(item.permission) || 
                   user?.roles?.some((role: any) => 
                       role.permissions?.includes(item.permission)
                   );
        }

        // If no permission specified, show the item
        return true;
    });

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={filteredNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
