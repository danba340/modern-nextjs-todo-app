"use server";
import { type Todo } from "@prisma/client";
import { getServerAuthSession } from "../auth";
import { db } from "../db";

export async function getTodosAction(): Promise<Todo[] | null> {
  const session = await getServerAuthSession();
  if (!session) {
    return null;
  }
  return db.todo.findMany({ where: { createdById: session.user.id } });
}

export async function createTodoAction(name: string): Promise<Todo | null> {
  const session = await getServerAuthSession();
  if (!session) {
    return null;
  }
  return db.todo.create({ data: { name, createdById: session.user.id } });
}

export async function deleteTodoAction(id: number): Promise<Todo | null> {
  const session = await getServerAuthSession();
  if (!session) {
    return null;
  }
  return db.todo.delete({ where: { id, createdById: session.user.id } });
}

export async function updateTodoAction(
  id: number,
  done: boolean,
): Promise<Todo | null> {
  const session = await getServerAuthSession();
  if (!session) {
    return null;
  }
  return db.todo.update({
    where: { id, createdById: session.user.id },
    data: { done },
  });
}
