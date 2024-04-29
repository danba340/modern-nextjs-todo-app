"use client"

import { signIn, signOut, useSession } from "next-auth/react";

export function Account() {
	const { data: session } = useSession();

	return (
		<div className="flex flex-col items-center gap-2">
			<div className="flex flex-col items-center justify-center gap-4">
				<p className="text-center text-l text-white">
					{session && <span>Logged in as {session.user?.email}</span>}
				</p>
				<button
					className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
					onClick={session ? () => void signOut() : () => void signIn()}
				>
					{session ? "Sign out" : "Sign in"}
				</button>
			</div>
		</div>
	)
}