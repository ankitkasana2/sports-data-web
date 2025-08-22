import React from 'react'
import { Link } from 'react-router-dom';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
  navigationMenuTriggerStyle,
} from "./ui/navigation-menu"

import { ClipboardList, Plus } from 'lucide-react';


const navItems = [
  { href: "/", label: "Home" },
  {
    label: "Matches",
    links: [{
      href: '/matches',
      label: 'All Match',
      icon: <ClipboardList />
    },
    {
      href: '/matches/new',
      label: 'New Match',
      icon: <Plus />
    }]
  },
  {
    label: "Teams",
    links: [{
      href: '/teams',
      label: 'All Teams',
      icon: <ClipboardList />
    },
    {
      href: '/teams/create',
      label: 'Create Team',
      icon: <Plus />
    }]
  },
  {
    label: "Players",
    links: [{
      href: '/players',
      label: 'All Players',
      icon: <ClipboardList />
    },
    {
      href: '/players/create',
      label: 'Add Players',
      icon: <Plus />
    }]
  },
  { href: "/exports", label: "Exports" },
  { href: "/admin", label: "Admin" },
  { href: "/analytics", label: "Analytics" },
]



const Navbar = () => {
  return (
    <section className='flex justify-between p-[15px] sticky top-0 bg-white z-30'>
      {/* logo  */}
      <Link to={'/'} className='font-extrabold text-2xl text-gray-900 hover:cursor-pointer'>GAA</Link>

      {/* links  */}
      <div>
        <NavigationMenu viewport={false}>
          <NavigationMenuList>
            {navItems.map((val, index) => {
              return <NavigationMenuItem key={index}>
                {val.links && <><NavigationMenuTrigger>{val.label}</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className='w-[200px]'>
                      {val.links.map((link, index) => {
                        return <NavigationMenuLink key={index} asChild>
                          <Link to={''} className='flex gap-2 flex-row items-center'>{link.icon} {link.label}</Link>
                        </NavigationMenuLink>
                      })}
                    </div>
                  </NavigationMenuContent></>}

                {val.href && <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                  <Link to={''}>{val.label}</Link>
                </NavigationMenuLink>}
              </NavigationMenuItem>
            })}
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </section>
  )
}

export default Navbar