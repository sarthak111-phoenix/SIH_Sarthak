import { db } from "@/lib/db";

export type KnowledgeEntryInput = {
  factoryId: string;
  title: string;
  category: "MACHINE_SOP" | "PROCESS_SPEC" | "TROUBLESHOOTING" | "SUPPLIER_NOTE" | "HISTORICAL_DECISION";
  content: string;
  tags: string[];
  userId?: string;
};

export async function createKnowledgeEntry(input: KnowledgeEntryInput) {
  let userId = input.userId;

  let user = userId ? await db.user.findUnique({ where: { id: userId } }) : null;

  if (!user) {
    user = await db.user.findFirst({ where: { factoryId: input.factoryId } });
  }

  if (!user) {
    let role = await db.role.findFirst({ where: { factoryId: input.factoryId } });
    if (!role) {
      role = await db.role.create({
        data: {
          factoryId: input.factoryId,
          name: "Manager",
          permissions: JSON.stringify(["*"]),
        },
      });
    }

    user = await db.user.create({
      data: {
        factoryId: input.factoryId,
        name: "Factory Manager",
        email: `manager_${Date.now()}_${Math.random().toString(36).substring(7)}@factory.com`,
        passwordHash: "hashed_pass",
        roleId: role.id,
      },
    });
  }

  return db.factoryKnowledge.create({
    data: {
      factoryId: input.factoryId,
      title: input.title,
      category: input.category,
      content: input.content,
      tags: JSON.stringify(input.tags),
      createdBy: user.id,
    },
  });
}

export async function searchFactoryKnowledge(
  factoryId: string,
  query?: string,
  category?: string
) {
  const whereClause: any = { factoryId };

  if (category) {
    whereClause.category = category;
  }

  const entries = await db.factoryKnowledge.findMany({
    where: whereClause,
    include: { author: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });

  if (!query || query.trim() === "") {
    return entries;
  }

  const qLower = query.toLowerCase();
  return entries.filter(
    (e) =>
      e.title.toLowerCase().includes(qLower) ||
      e.content.toLowerCase().includes(qLower) ||
      e.tags.toLowerCase().includes(qLower)
  );
}
