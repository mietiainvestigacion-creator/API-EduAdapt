export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          role: string;
          created_at: string;
        };
        Insert: {
          id: string;
          full_name?: string;
          role?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          role?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      classes: {
        Row: {
          id: string;
          teacher_id: string;
          name: string;
          join_code: string;
          active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          teacher_id: string;
          name: string;
          join_code: string;
          active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          teacher_id?: string;
          name?: string;
          join_code?: string;
          active?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      class_students: {
        Row: {
          id: string;
          class_id: string;
          display_name: string;
          student_code: string;
          tutor_profile: string | null;
          interest: string | null;
          pace: string | null;
          active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          class_id: string;
          display_name: string;
          student_code: string;
          tutor_profile?: string | null;
          interest?: string | null;
          pace?: string | null;
          active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          class_id?: string;
          display_name?: string;
          student_code?: string;
          tutor_profile?: string | null;
          interest?: string | null;
          pace?: string | null;
          active?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      lessons: {
        Row: {
          id: string;
          title: string;
          objective: string;
          competency: string;
          difficulty: number;
          sort_order: number;
          pre_test_question: string;
          pre_test_answer: string;
          post_test_question: string;
          post_test_answer: string;
          created_at: string;
        };
        Insert: {
          id: string;
          title: string;
          objective?: string;
          competency?: string;
          difficulty?: number;
          sort_order?: number;
          pre_test_question?: string;
          pre_test_answer?: string;
          post_test_question?: string;
          post_test_answer?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          objective?: string;
          competency?: string;
          difficulty?: number;
          sort_order?: number;
          pre_test_question?: string;
          pre_test_answer?: string;
          post_test_question?: string;
          post_test_answer?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      class_lessons: {
        Row: {
          class_id: string;
          lesson_id: string;
          enabled: boolean;
          sort_order: number | null;
        };
        Insert: {
          class_id: string;
          lesson_id: string;
          enabled?: boolean;
          sort_order?: number | null;
        };
        Update: {
          class_id?: string;
          lesson_id?: string;
          enabled?: boolean;
          sort_order?: number | null;
        };
        Relationships: [];
      };
      progress: {
        Row: {
          id: string;
          student_id: string;
          lesson_id: string;
          stage: string;
          started_at: string;
          completed_at: string | null;
          pre_test_score: number | null;
          post_test_score: number | null;
          messages_count: number;
          reflection: string | null;
          autonomy_level: number;
          motivation: number;
          difficulty_adjustment: number;
          updated_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          lesson_id: string;
          stage?: string;
          started_at?: string;
          completed_at?: string | null;
          pre_test_score?: number | null;
          post_test_score?: number | null;
          messages_count?: number;
          reflection?: string | null;
          autonomy_level?: number;
          motivation?: number;
          difficulty_adjustment?: number;
          updated_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          lesson_id?: string;
          stage?: string;
          started_at?: string;
          completed_at?: string | null;
          pre_test_score?: number | null;
          post_test_score?: number | null;
          messages_count?: number;
          reflection?: string | null;
          autonomy_level?: number;
          motivation?: number;
          difficulty_adjustment?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      interaction_logs: {
        Row: {
          id: string;
          student_id: string;
          lesson_id: string | null;
          type: string;
          payload: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          lesson_id?: string | null;
          type: string;
          payload?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          lesson_id?: string | null;
          type?: string;
          payload?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      student_sessions: {
        Row: {
          id: string;
          student_id: string;
          token_hash: string;
          expires_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          token_hash: string;
          expires_at: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          token_hash?: string;
          expires_at?: string;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
