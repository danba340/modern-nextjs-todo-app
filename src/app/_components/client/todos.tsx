"use client"
import { type Todo } from "@prisma/client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useOptimistic, useTransition, useState } from "react";
import { toast } from "sonner";
import { createTodoAction, deleteTodoAction, updateTodoAction } from "~/server/actions/todo";

export function Todos({ todos }: { todos: Todo[] }) {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();
	const [newTodoName, setNewTodoName] = useState("")
	const [optimisticTodos, setOptimisticTodos] = useOptimistic(
		todos,
		(todos: Todo[], { todo, action }: { todo: Todo, action: "add" | "update" | "delete" }) => {
			if (action == "add") {
				return [
					...todos,
					todo
				]
			}
			else if (action == "update") {
				return todos.map(t => {
					if (t.id == todo.id) {
						return {
							...todo,
							done: todo.done
						}
					}
					return t
				})
			}
			else if (action === "delete") {
				return todos.filter(t => t.id != todo.id)
			}
			// Fallback
			console.warn("unhandled action type:", action)
			return todos
		}
	);

	const { data: session } = useSession();
	if (!session) {
		return (
			<div>Log in to see your todos</div>
		)
	}

	async function deleteHandler(todo: Todo) {
		setOptimisticTodos({ todo, action: "delete" })
		const deletedTodo = await deleteTodoAction(todo.id)
		if (!deletedTodo) {
			toast.error("Todo deletion error")
		}
		router.refresh()
	}

	async function doneHandler(todo: Todo, done: boolean) {
		setOptimisticTodos({
			todo: {
				...todo,
				done,
			},
			action: "update"
		})
		const updatedTodo = await updateTodoAction(todo.id, done)
		if (!updatedTodo) {
			toast.error("Todo update error")
		}
		router.refresh()
	}

	async function createHandler() {

		if (!newTodoName) {
			toast.error("Todo name missing")
			return
		}

		const tempId = Math.random() * 100000
		const now = new Date();
		const todo: Todo = {
			id: tempId,
			name: newTodoName,
			createdAt: now,
			updatedAt: now,
			done: false,
			createdById: String(tempId)
		}
		setOptimisticTodos({
			todo,
			action: "add"
		})
		const newTodo = await createTodoAction(todo.name)
		if (!newTodo) {
			toast.error("Todo creation error")
		}
		setNewTodoName("")
		router.refresh()
	}

	return (
		<div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
			{session && (
				<div className="grid grid-cols-1 gap-4 md:gap-8">
					<div
						className="flex flex-col gap-4 rounded-xl bg-white/10 p-4 text-white"
					>
						<h3 className="text-xl font-bold">Todos</h3>
						{optimisticTodos.map(todo => {
							const { id, name, done } = todo
							return (
								<div
									key={id}
									className="flex gap-2 items-center justify-between"
								>
									<div className="flex gap-2 items-center">
										<input
											className="cursor-pointer w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-blue-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-blue-600 dark:ring-offset-gray-800"
											type="checkbox" name="done" id={String(id)} checked={done}
											onChange={() => startTransition(() => doneHandler(todo, !done))}
										/>
										<label htmlFor={String(id)} className={`cursor-pointer ${done ? "line-through" : ""}`}>
											{name}
										</label>
									</div>
									<button
										disabled={isPending}
										className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-2 py-1 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
										onClick={() => startTransition(() => deleteHandler(todo))}
									>Delete</button>
								</div>
							)
						})}
						<div className="flex gap-2">
							<input
								onChange={(e) => {
									setNewTodoName(e.target.value)
								}}
								disabled={isPending}
								className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-900 dark:border-gray-700 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
								placeholder="New Todo..."
								type="text"
							/>
							<button
								onClick={() => startTransition(() => createHandler())}
								disabled={isPending}
								className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
							>Create</button>
						</div>
					</div>
				</div>
			)
			}
		</div >
	)
}