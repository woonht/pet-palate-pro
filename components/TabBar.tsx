import { PlatformPressable } from "@react-navigation/elements";
import { getFocusedRouteNameFromRoute, useLinkBuilder, useTheme } from '@react-navigation/native';
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Feather, FontAwesome6, MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons"

const TabBar = ({ state, descriptors, navigation }: BottomTabBarProps) => {

  const { colors } = useTheme();
  const { buildHref } = useLinkBuilder();

  const focusedRoute = state.routes[state.index];
  const routeName = getFocusedRouteNameFromRoute(focusedRoute) ?? focusedRoute.name;
  
  const hiddenTabScreens = ['basic_info', 'basic_info_input', 'personality_habit_input', 
                            'medical_record', 'prescription', 
                            'automated_schedule',
                            'auth/sign_in', 'auth/sign_up'];
  
  if (hiddenTabScreens.includes(routeName)) {
    return null;
  }

  type IconProps = { color: string };
  const icons: { [key: string]: (props: IconProps) => JSX.Element } = {
    'home': () => <MaterialIcons name="pets" size={30} color="white"/>,
    'manual': () => <FontAwesome6 name="bowl-rice" size={30} color="white" />,
    'food_water': () => <MaterialCommunityIcons name="car-brake-fluid-level" size={30} color="white" />,
    'settings_page': () => <Feather name="settings" size={30} color='white' />,
  };


  return (
    <View style={styles.tabbar}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined //tabBarLabel can be string or function
            ? options.tabBarLabel
            : options.title !== undefined
              ? options.title
              : route.name;
        
        console.log('route name: ', route.name )
        if(!icons[route.name] || ['_sitemap', '+not-found'].includes(route.name)) return null;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        return (
          <PlatformPressable
            key={route.key}
            style={styles.tabbarItems}
            href={buildHref(route.name, route.params)}
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarButtonTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            android_ripple={{color: null}}
          >
            {
              icons[route.name]({
                color: isFocused? colors.primary : 'white'
              })
            }
            {typeof label === 'function' ? (
              label({
                focused: isFocused,
                color: isFocused ? colors.primary : colors.text,
                position: 'below-icon',
                children: route.name,
              })
            ) : (
              <Text style={{ color: isFocused ? colors.primary : 'white' }}>
                {label}
              </Text>
            )}
          </PlatformPressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({

  tabbar: {
    position: 'absolute',
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#AA4600',
    borderRadius: 25,
    margin: 10,
  },

  tabbarItems: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    top: 10,
  }
})

export default TabBar;
