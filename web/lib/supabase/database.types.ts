// Hand-written to match supabase/migrations/0001_init.sql exactly.
//
// Once a real Supabase project exists, regenerate with:
//   npx supabase gen types typescript --project-id <ref> > lib/supabase/database.types.ts
// and diff against this file rather than trusting it blindly — this was
// written by reading the migration, not generated from a live database.
//
// Every table entry needs Row/Insert/Update/Relationships (Relationships
// left as [] — we don't use PostgREST's embedded-resource joins anywhere)
// to satisfy postgrest-js's GenericTable shape; omitting any of them makes
// the whole client's generics silently collapse to `never`.

export type WeightUnit = "kg" | "lb";
export type HealthLogType = "weight" | "jaundice" | "temperature" | "other";

export interface Database {
  public: {
    Tables: {
      family_members: {
        Row: {
          family_id: string;
          user_id: string;
          auth_method: string;
          joined_at: string;
        };
        Insert: Record<string, never>; // written only by the create_family/join_family_by_code RPCs
        Update: Record<string, never>;
        Relationships: [];
      };
      babies: {
        Row: {
          id: string;
          family_id: string;
          name: string;
          dob: string | null;
          birth_weight: number | null;
          weight_unit: WeightUnit;
          gestation_weeks: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          family_id: string;
          name?: string;
          dob?: string | null;
          birth_weight?: number | null;
          weight_unit?: WeightUnit;
          gestation_weeks?: number | null;
        };
        Update: Partial<Database["public"]["Tables"]["babies"]["Insert"]>;
        Relationships: [];
      };
      appointments: {
        Row: {
          id: string;
          family_id: string;
          baby_id: string;
          type: string;
          date: string;
          time: string | null;
          title: string;
          notes: string;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          family_id: string;
          baby_id: string;
          type: string;
          date: string;
          time?: string | null;
          title?: string;
          notes?: string;
        };
        Update: Partial<Database["public"]["Tables"]["appointments"]["Insert"]>;
        Relationships: [];
      };
      health_logs: {
        Row: {
          id: string;
          family_id: string;
          baby_id: string;
          type: HealthLogType;
          value: string;
          value_numeric: number | null;
          unit: string;
          date: string;
          notes: string;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          family_id: string;
          baby_id: string;
          type: HealthLogType;
          value: string;
          unit?: string;
          date: string;
          notes?: string;
        };
        Update: Partial<Database["public"]["Tables"]["health_logs"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      create_family: {
        Args: Record<string, never>;
        Returns: { family_id: string; code: string }[];
      };
      join_family_by_code: {
        Args: { p_code: string };
        Returns: string | null;
      };
      delete_my_family: {
        Args: { p_family_id: string };
        Returns: undefined;
      };
    };
  };
}
