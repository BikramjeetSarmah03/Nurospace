export default function ProjectSidebar() {
  return (
    <aside className="bg-white shadow p-4 border-r w-40 md:w-80">
      {SidebarList.map((item) => (
        <div key={item.name}>{item.name}</div>
      ))}
    </aside>
  );
}

const SidebarList = [
  {
    name: "Chats", // AI chat threads per project
  },
  {
    name: "Resources", // PDFs, links, images, docs, videos
  },
  {
    name: "Tasks", // TODOs, action items (can be AI-generated)
  },
  {
    name: "Agents", // AI agents running automations or tasks
  },
  {
    name: "Personalities", // Custom AI personas / assistants
  },
  {
    name: "Integrations", // 3rd-party connections (Notion, GitHub, etc.)
  },
  {
    name: "Settings", // Project-specific configuration
  },
];
