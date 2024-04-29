import { getTodosAction } from "~/server/actions/todo";
import { Account } from "./_components/client/account";
import { Todos } from "./_components/client/todos";
import { ClientSessionWrapper } from "./_components/client/client-session-wrapper";

export default async function HomePage() {
  const todos = await getTodosAction()
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#0f1235] to-[#090920]">
      <ClientSessionWrapper>
        <Todos todos={todos ?? []} />
        <Account />
      </ClientSessionWrapper>
    </main>
  );
}
