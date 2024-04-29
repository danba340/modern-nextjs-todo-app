"use client"
import { SessionProvider } from "next-auth/react";
import { type PropsWithChildren } from "react";

export function ClientSessionWrapper({ children }: PropsWithChildren) {
	return (
		<SessionProvider>
			{children}
		</SessionProvider>
	)
}