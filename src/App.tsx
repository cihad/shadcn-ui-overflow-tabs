import { HamburgerMenuIcon } from '@radix-ui/react-icons';
import { AppTabs, AppTabsList } from './components/app/tabs';
import { Button } from './components/ui/button';
import { TabsContent, TabsTrigger } from './components/ui/tabs';
import { forwardRef } from 'react';

function App() {
  return (
    <div className="p-3 w-[400px]">
      <AppTabs defaultValue="account">
        <AppTabsList
          renderMenuTrigger={
            forwardRef((props, ref) => (
              <Button variant="outline" size="icon" className="ml-auto shrink-0 w-7 h-7" ref={ref} {...props}>
                <HamburgerMenuIcon />
              </Button>
            ))
          }
        >
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
          <TabsTrigger value="about">About</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
        </AppTabsList>
        <TabsContent value="account">
          Make changes to your account here.
        </TabsContent>
        <TabsContent value="password">Change your password here.</TabsContent>
        <TabsContent value="settings">settings content</TabsContent>
        <TabsContent value="contact">contact</TabsContent>
        <TabsContent value="about">about</TabsContent>
        <TabsContent value="services">services</TabsContent>
      </AppTabs>
    </div>
  );
}

export default App;
