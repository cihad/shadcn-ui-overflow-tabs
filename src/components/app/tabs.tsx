import React, {
  ComponentPropsWithoutRef, useRef,
  useState,
  ElementRef,
  forwardRef, useEffect,
  useContext,
  useCallback,
  RefObject,
  ReactElement,
  ComponentRef,
  isValidElement, ForwardRefExoticComponent,
  RefAttributes
} from 'react';
import { Tabs, TabsList } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { HamburgerMenuIcon } from '@radix-ui/react-icons';

import { cn, mergeRefs } from '@/lib/utils';
import { useResizeObserver } from '../hooks/use-resize-observer';


interface ItemsState {
  listItems: {
    instance: ReactElement
    width?: number
  }[],
  menuItems: {
    instance: ReactElement
    width?: number
  }[],
  initial: boolean
}


interface AppTabsListProps extends ComponentPropsWithoutRef<typeof TabsList> {
  renderMenuTrigger?: AppTabsListMoreMenuProps['renderMenuTrigger']
}

export const AppTabsList = forwardRef<ElementRef<typeof TabsList>, AppTabsListProps>(
  function AppTabsList({ children, className, renderMenuTrigger, ...props }, ref) {
    const innerRef = useRef<ElementRef<typeof TabsList>>(null);
    const moreButtonRef = useRef<ComponentRef<typeof Button>>(null)
    const [currentTabValue] = useContext(AppTabsContext)
    const [{ listItems, menuItems, initial }, setItems] = useState<ItemsState>({ listItems: [], menuItems: [], initial: true })

    const calculateOverflowItems = useCallback(() => {
      let items: ItemsState['listItems'] = []
      const maxWidth = getContentWidth(innerRef.current!) - (moreButtonRef.current?.offsetWidth ?? 0)

      const _children = React.Children.toArray(children).filter(child => isValidElement(child));
      const childrenCount = React.Children.count(children)
      for (let i = 0; i < childrenCount; i++) {
        const child = _children[i];
        const el = React.cloneElement(child, {
          ref: (dom?: HTMLElement) => {
            if (!dom) return

            if (i === 0) {
              items = []
            }

            items.push({
              width: dom.getBoundingClientRect().width,
              instance: child
            })

            if (i === childrenCount - 1) {
              const _items = getItems(items, currentTabValue, maxWidth)
              setItems({ ..._items, initial: false })
            }
          },
        })

        items.push({ instance: el })
      }

      setItems({
        listItems: items,
        menuItems: [],
        initial: true
      })
    }, [children, currentTabValue])

    useEffect(() => {
      calculateOverflowItems()
    }, [children, currentTabValue]);

    useResizeObserver(() => {
      calculateOverflowItems()
    }, innerRef as RefObject<HTMLElement>)

    return (
      <TabsList
        ref={mergeRefs(ref, innerRef)}
        {...props}
        className={cn('flex justify-start', className)}
      >
        {listItems.map(i => i.instance)}
        <AppTabsListMoreMenu ref={moreButtonRef} initial={initial} items={menuItems} renderMenuTrigger={renderMenuTrigger} />
      </TabsList>
    );
  }
);

const AppTabsContext = React.createContext<[string | undefined, React.Dispatch<React.SetStateAction<string | undefined>>] | []>([]);


export function AppTabs({ defaultValue, onValueChange, ...props }: ComponentPropsWithoutRef<typeof Tabs>) {
  const [currentTabValue, setCurrentTabValue] = useState<string | undefined>(defaultValue);

  return (
    <AppTabsContext.Provider value={[currentTabValue, setCurrentTabValue]}>
      <Tabs
        onValueChange={(val) => {
          onValueChange?.(val)
          setCurrentTabValue(val)
        }}
        value={currentTabValue}
        {...props}
      />
    </AppTabsContext.Provider>
  );
}

interface AppTabsListMoreMenuProps {
  items: ItemsState['menuItems'];
  initial: boolean,
  renderMenuTrigger?: Exclude<typeof DropdownMenuTrigger, 'asChild'>
}

export const AppTabsListMoreMenu = forwardRef<ComponentRef<typeof Button>, AppTabsListMoreMenuProps>(function TabListMoreMenu({
  items,
  initial,
  renderMenuTrigger: MenuTriggerComponent
}, ref) {
  const [, setCurrentTabValue] = useContext(AppTabsContext)

  if (!initial && items.length === 0) return null


  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {
          MenuTriggerComponent ? <MenuTriggerComponent ref={ref} /> : (
            <Button variant="outline" size="icon" className="ml-auto shrink-0" ref={ref}>
              <HamburgerMenuIcon />
            </Button>
          )
        }
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {items.map(({ instance: { props: { value, children } } }) => (
          <DropdownMenuItem
            key={value}
            onSelect={() => {
              setCurrentTabValue?.(value)
            }}
          >
            {children}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
})

function getItems(tabs: ItemsState['listItems'], currentTabName: string | undefined, maxWidth: number) {
  let listItems = [];
  const menuItems = [];
  let totalWidth = 0;

  for (const tab of tabs) {
    totalWidth += tab.width!;
    if (totalWidth > maxWidth) {
      menuItems.push(tab);
    } else {
      listItems.push(tab);
    }
  }

  const idxCurrentTabInMenuItems = menuItems.findIndex(
    (item) => item.instance.props.value === currentTabName,
  );
  if (idxCurrentTabInMenuItems > -1) {
    const currentTab = menuItems[idxCurrentTabInMenuItems];
    menuItems.splice(idxCurrentTabInMenuItems, 1);

    let kalan = maxWidth - currentTab.width!;
    const sliceIdx = listItems.findIndex((tab) => {
      if (kalan >= tab.width!) {
        kalan -= tab.width!;
        return false;
      }

      return true;
    });

    menuItems.unshift(...listItems.slice(sliceIdx));
    listItems = listItems.slice(0, sliceIdx);
    listItems.push(currentTab);
  }

  return {
    listItems,
    menuItems,
  };
}


function getContentWidth(element: HTMLElement) {
  // Elemanın stilini al
  const style = window.getComputedStyle(element);

  // Padding değerlerini al
  const paddingLeft = parseFloat(style.paddingLeft);
  const paddingRight = parseFloat(style.paddingRight);

  // Elemanın toplam genişliğini al
  const elementWidth = element.clientWidth;

  // İçerik genişliğini hesapla
  const contentWidth = elementWidth - paddingLeft - paddingRight;

  return contentWidth;
}