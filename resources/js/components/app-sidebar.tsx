import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { BookOpen, Folder, LayoutGrid } from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Product Category',
        href:'/categories',
        icon: LayoutGrid,
    },
    {
        title: 'Procurement',
        href:'/procurements',
        icon: LayoutGrid,
    },
    {
        title: 'EOI',
        href:'/eois',
        icon: LayoutGrid,
    },
    // {
    //     title: 'Vendors',
    //     href:'/product-categories',
    //     icon: LayoutGrid,
    // },
    {
        title: 'Roles',
        href:'/roles',
        icon: LayoutGrid,
    },
    {
        title: 'Permissions',
        href:'/permissions',
        icon: LayoutGrid,
    },
    {
        title: 'Users',
        href:'/users',
        icon: LayoutGrid,
    },
    {
        title: 'Vendors',
        href:'/vendors',
        icon: LayoutGrid,
    },
];


export function AppSidebar() {
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
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                {/* <NavFooter items={footerNavItems} className="mt-auto" /> */}
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
