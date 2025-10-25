export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      agent_performance: {
        Row: {
          agent_id: string
          avg_profit_per_trade: number | null
          id: string
          losing_trades: number | null
          max_drawdown: number | null
          recorded_at: string
          sharpe_ratio: number | null
          total_profit: number | null
          total_profit_usd: number | null
          total_trades: number | null
          win_rate: number | null
          winning_trades: number | null
        }
        Insert: {
          agent_id: string
          avg_profit_per_trade?: number | null
          id?: string
          losing_trades?: number | null
          max_drawdown?: number | null
          recorded_at?: string
          sharpe_ratio?: number | null
          total_profit?: number | null
          total_profit_usd?: number | null
          total_trades?: number | null
          win_rate?: number | null
          winning_trades?: number | null
        }
        Update: {
          agent_id?: string
          avg_profit_per_trade?: number | null
          id?: string
          losing_trades?: number | null
          max_drawdown?: number | null
          recorded_at?: string
          sharpe_ratio?: number | null
          total_profit?: number | null
          total_profit_usd?: number | null
          total_trades?: number | null
          win_rate?: number | null
          winning_trades?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_performance_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      agents: {
        Row: {
          config: Json | null
          created_at: string
          description: string | null
          id: string
          last_active_at: string | null
          max_position_size: number | null
          name: string
          risk_level: number | null
          status: Database["public"]["Enums"]["agent_status"]
          strategy: string | null
          trading_pairs: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          config?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          last_active_at?: string | null
          max_position_size?: number | null
          name: string
          risk_level?: number | null
          status?: Database["public"]["Enums"]["agent_status"]
          strategy?: string | null
          trading_pairs?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          config?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          last_active_at?: string | null
          max_position_size?: number | null
          name?: string
          risk_level?: number | null
          status?: Database["public"]["Enums"]["agent_status"]
          strategy?: string | null
          trading_pairs?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      dew_tokens: {
        Row: {
          balance: number
          created_at: string
          id: string
          total_earned: number | null
          total_spent: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number
          created_at?: string
          id?: string
          total_earned?: number | null
          total_spent?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number
          created_at?: string
          id?: string
          total_earned?: number | null
          total_spent?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      governance_proposals: {
        Row: {
          created_at: string
          description: string
          executed_at: string | null
          id: string
          proposer_id: string
          quorum_required: number
          status: Database["public"]["Enums"]["proposal_status"]
          title: string
          votes_against: number | null
          votes_for: number | null
          voting_ends_at: string
        }
        Insert: {
          created_at?: string
          description: string
          executed_at?: string | null
          id?: string
          proposer_id: string
          quorum_required: number
          status?: Database["public"]["Enums"]["proposal_status"]
          title: string
          votes_against?: number | null
          votes_for?: number | null
          voting_ends_at: string
        }
        Update: {
          created_at?: string
          description?: string
          executed_at?: string | null
          id?: string
          proposer_id?: string
          quorum_required?: number
          status?: Database["public"]["Enums"]["proposal_status"]
          title?: string
          votes_against?: number | null
          votes_for?: number | null
          voting_ends_at?: string
        }
        Relationships: []
      }
      holdings: {
        Row: {
          amount: number
          asset_name: string
          asset_symbol: string
          average_buy_price: number | null
          change_24h: number | null
          change_24h_percent: number | null
          created_at: string
          current_price: number | null
          id: string
          portfolio_id: string
          updated_at: string
          value_usd: number | null
        }
        Insert: {
          amount?: number
          asset_name: string
          asset_symbol: string
          average_buy_price?: number | null
          change_24h?: number | null
          change_24h_percent?: number | null
          created_at?: string
          current_price?: number | null
          id?: string
          portfolio_id: string
          updated_at?: string
          value_usd?: number | null
        }
        Update: {
          amount?: number
          asset_name?: string
          asset_symbol?: string
          average_buy_price?: number | null
          change_24h?: number | null
          change_24h_percent?: number | null
          created_at?: string
          current_price?: number | null
          id?: string
          portfolio_id?: string
          updated_at?: string
          value_usd?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "holdings_portfolio_id_fkey"
            columns: ["portfolio_id"]
            isOneToOne: false
            referencedRelation: "portfolios"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          amount: number
          base_asset: string
          created_at: string
          filled_amount: number | null
          filled_at: string | null
          id: string
          order_side: Database["public"]["Enums"]["order_side"]
          order_type: Database["public"]["Enums"]["order_type"]
          price: number | null
          quote_asset: string
          status: Database["public"]["Enums"]["order_status"]
          stop_price: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          base_asset: string
          created_at?: string
          filled_amount?: number | null
          filled_at?: string | null
          id?: string
          order_side: Database["public"]["Enums"]["order_side"]
          order_type: Database["public"]["Enums"]["order_type"]
          price?: number | null
          quote_asset: string
          status?: Database["public"]["Enums"]["order_status"]
          stop_price?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          base_asset?: string
          created_at?: string
          filled_amount?: number | null
          filled_at?: string | null
          id?: string
          order_side?: Database["public"]["Enums"]["order_side"]
          order_type?: Database["public"]["Enums"]["order_type"]
          price?: number | null
          quote_asset?: string
          status?: Database["public"]["Enums"]["order_status"]
          stop_price?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      pool_transactions: {
        Row: {
          amount: number
          amount_usd: number | null
          asset_symbol: string
          created_at: string
          id: string
          pool_id: string
          transaction_type: string
        }
        Insert: {
          amount: number
          amount_usd?: number | null
          asset_symbol: string
          created_at?: string
          id?: string
          pool_id: string
          transaction_type: string
        }
        Update: {
          amount?: number
          amount_usd?: number | null
          asset_symbol?: string
          created_at?: string
          id?: string
          pool_id?: string
          transaction_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "pool_transactions_pool_id_fkey"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "pools"
            referencedColumns: ["id"]
          },
        ]
      }
      pools: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          pool_number: number
          reserve_ratio: number | null
          total_liquidity: number
          total_liquidity_usd: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          pool_number: number
          reserve_ratio?: number | null
          total_liquidity?: number
          total_liquidity_usd?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          pool_number?: number
          reserve_ratio?: number | null
          total_liquidity?: number
          total_liquidity_usd?: number
          updated_at?: string
        }
        Relationships: []
      }
      portfolios: {
        Row: {
          change_24h: number | null
          change_24h_percent: number | null
          created_at: string
          id: string
          total_value: number
          total_value_usd: number
          updated_at: string
          user_id: string
        }
        Insert: {
          change_24h?: number | null
          change_24h_percent?: number | null
          created_at?: string
          id?: string
          total_value?: number
          total_value_usd?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          change_24h?: number | null
          change_24h_percent?: number | null
          created_at?: string
          id?: string
          total_value?: number
          total_value_usd?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          biometric_enabled: boolean | null
          country: string | null
          created_at: string
          date_of_birth: string | null
          full_name: string | null
          id: string
          kyc_verified: boolean | null
          kyc_verified_at: string | null
          phone_number: string | null
          two_factor_enabled: boolean | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          biometric_enabled?: boolean | null
          country?: string | null
          created_at?: string
          date_of_birth?: string | null
          full_name?: string | null
          id: string
          kyc_verified?: boolean | null
          kyc_verified_at?: string | null
          phone_number?: string | null
          two_factor_enabled?: boolean | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          biometric_enabled?: boolean | null
          country?: string | null
          created_at?: string
          date_of_birth?: string | null
          full_name?: string | null
          id?: string
          kyc_verified?: boolean | null
          kyc_verified_at?: string | null
          phone_number?: string | null
          two_factor_enabled?: boolean | null
          updated_at?: string
        }
        Relationships: []
      }
      proposal_votes: {
        Row: {
          created_at: string
          id: string
          proposal_id: string
          vote_for: boolean
          vote_weight: number
          voter_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          proposal_id: string
          vote_for: boolean
          vote_weight: number
          voter_id: string
        }
        Update: {
          created_at?: string
          id?: string
          proposal_id?: string
          vote_for?: boolean
          vote_weight?: number
          voter_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "proposal_votes_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "governance_proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          amount_usd: number | null
          asset_symbol: string
          completed_at: string | null
          created_at: string
          fee: number | null
          fee_usd: number | null
          from_address: string | null
          id: string
          network: string | null
          notes: string | null
          status: Database["public"]["Enums"]["transaction_status"]
          to_address: string | null
          transaction_hash: string | null
          transaction_type: Database["public"]["Enums"]["transaction_type"]
          user_id: string
        }
        Insert: {
          amount: number
          amount_usd?: number | null
          asset_symbol: string
          completed_at?: string | null
          created_at?: string
          fee?: number | null
          fee_usd?: number | null
          from_address?: string | null
          id?: string
          network?: string | null
          notes?: string | null
          status?: Database["public"]["Enums"]["transaction_status"]
          to_address?: string | null
          transaction_hash?: string | null
          transaction_type: Database["public"]["Enums"]["transaction_type"]
          user_id: string
        }
        Update: {
          amount?: number
          amount_usd?: number | null
          asset_symbol?: string
          completed_at?: string | null
          created_at?: string
          fee?: number | null
          fee_usd?: number | null
          from_address?: string | null
          id?: string
          network?: string | null
          notes?: string | null
          status?: Database["public"]["Enums"]["transaction_status"]
          to_address?: string | null
          transaction_hash?: string | null
          transaction_type?: Database["public"]["Enums"]["transaction_type"]
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      agent_status: "active" | "inactive" | "paused" | "error"
      app_role: "user" | "admin"
      order_side: "buy" | "sell"
      order_status:
        | "open"
        | "filled"
        | "partially_filled"
        | "cancelled"
        | "rejected"
      order_type: "market" | "limit" | "stop"
      proposal_status: "active" | "passed" | "rejected" | "executed"
      transaction_status: "pending" | "completed" | "failed" | "cancelled"
      transaction_type:
        | "deposit"
        | "withdrawal"
        | "trade"
        | "conversion"
        | "fee"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      agent_status: ["active", "inactive", "paused", "error"],
      app_role: ["user", "admin"],
      order_side: ["buy", "sell"],
      order_status: [
        "open",
        "filled",
        "partially_filled",
        "cancelled",
        "rejected",
      ],
      order_type: ["market", "limit", "stop"],
      proposal_status: ["active", "passed", "rejected", "executed"],
      transaction_status: ["pending", "completed", "failed", "cancelled"],
      transaction_type: ["deposit", "withdrawal", "trade", "conversion", "fee"],
    },
  },
} as const
