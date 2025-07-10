import { FontAwesome } from "@expo/vector-icons";
import type { Provider } from "@supabase/supabase-js";
import { JSX } from "react";

/**
 * An array of supported social authentication providers, each with a display name, unique key, and associated icon.
 *
 * @remarks
 * The `icon` property uses FontAwesome icons with provider-specific colors.
 *
 * @example
 * ```tsx
 * {SOCIAL_PROVIDERS.map(provider => (
 *   <Button key={provider.key} icon={provider.icon} title={provider.name} />
 * ))}
 * ```
 *
 * @property name - The display name of the social provider.
 * @property key - The unique identifier for the provider (e.g., "google", "github", "azure").
 * @property icon - The JSX element representing the provider's icon.
 */
export const SOCIAL_PROVIDERS: { name: string; key: Provider; icon: JSX.Element }[] = [
	{
		name: "Google",
		key: "google",
		icon: <FontAwesome name="google" size={22} color="#EA4335" />,
	},
	{ name: "GitHub", key: "github", icon: <FontAwesome name="github" size={22} color="#333" /> },
	{
		name: "Microsoft",
		key: "azure",
		icon: <FontAwesome name="windows" size={22} color="#0078D4" />,
	},
];
