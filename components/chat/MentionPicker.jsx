import Image from "next/image";

export default function MentionPicker({
  members,
  insertMention,
  openUserProfile,
}) {
  if (!members?.length) return null;

  return (
    <div className="absolute bottom-[86px] left-4 right-4 max-h-72 overflow-y-auto rounded-xl border border-white/10 bg-[#111827] p-2 shadow-2xl">
      {members.map((member) => {
        const user = member.userId;

        return (
          <div
            key={member._id}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 hover:bg-white/[0.06]"
          >
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => openUserProfile(user)}
              className="shrink-0"
            >
              <Image
                src={user?.avatar || "/logo.png"}
                alt={user?.username || "User"}
                width={32}
                height={32}
                className="h-8 w-8 rounded-full"
              />
            </button>

            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => insertMention(member)}
              className="min-w-0 flex-1 text-left"
            >
              <p className="truncate text-sm font-bold text-white">
                {user?.username}
              </p>
              <p className="text-xs capitalize text-slate-500">
                @{user?.username}
              </p>
            </button>
          </div>
        );
      })}
    </div>
  );
}