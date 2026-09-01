export type UserRole = "admin" | "team_member";

export type ResourceType = "article" | "link" | "file" | "video";

export type AppUser = {
  id: string;
  role: UserRole;
  display_name: string;
  created_at: string;
}

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sort_order: number;
}

export type Resource = {
  id: string;
  category_id: string;
  title: string;
  description: string | null;
  content: string | null;
  resource_type: ResourceType;
  external_url: string | null;
  file_url: string | null;
  file_alt_text: string | null;
  is_featured: boolean;
  is_published: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export type SavedResource = {
  id: string;
  user_id: string;
  resource_id: string;
  saved_at: string;
}

export type GoalNote = {
  id: string;
  user_id: string;
  note_text: string;
  created_at: string;
  updated_at: string;
}

export type Group = {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

export type GroupMember = {
  group_id: string;
  user_id: string;
}

export type ResourceAssignment = {
  id: string;
  resource_id: string;
  user_id: string | null;
  group_id: string | null;
  created_by: string | null;
  created_at: string;
}

export type Database = {
  public: {
    Tables: {
      users: {
        Row: AppUser;
        Insert: Partial<AppUser> & { id: string; role: UserRole; display_name: string };
        Update: Partial<AppUser>;
        Relationships: [];
      };
      categories: {
        Row: Category;
        Insert: Partial<Category> & { name: string; slug: string };
        Update: Partial<Category>;
        Relationships: [];
      };
      resources: {
        Row: Resource;
        Insert: Partial<Resource> & { category_id: string; title: string; resource_type: ResourceType };
        Update: Partial<Resource>;
        Relationships: [
          {
            foreignKeyName: "resources_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          }
        ];
      };
      saved_resources: {
        Row: SavedResource;
        Insert: Partial<SavedResource> & { user_id: string; resource_id: string };
        Update: Partial<SavedResource>;
        Relationships: [
          {
            foreignKeyName: "saved_resources_resource_id_fkey";
            columns: ["resource_id"];
            isOneToOne: false;
            referencedRelation: "resources";
            referencedColumns: ["id"];
          }
        ];
      };
      goal_notes: {
        Row: GoalNote;
        Insert: Partial<GoalNote> & { user_id: string; note_text: string };
        Update: Partial<GoalNote>;
        Relationships: [];
      };
      groups: {
        Row: Group;
        Insert: Partial<Group> & { name: string };
        Update: Partial<Group>;
        Relationships: [];
      };
      group_members: {
        Row: GroupMember;
        Insert: GroupMember;
        Update: Partial<GroupMember>;
        Relationships: [
          {
            foreignKeyName: "group_members_group_id_fkey";
            columns: ["group_id"];
            isOneToOne: false;
            referencedRelation: "groups";
            referencedColumns: ["id"];
          }
        ];
      };
      resource_assignments: {
        Row: ResourceAssignment;
        Insert: Partial<ResourceAssignment> & { resource_id: string };
        Update: Partial<ResourceAssignment>;
        Relationships: [
          {
            foreignKeyName: "resource_assignments_resource_id_fkey";
            columns: ["resource_id"];
            isOneToOne: false;
            referencedRelation: "resources";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
}
