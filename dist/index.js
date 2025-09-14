var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import express2 from "express";
import session from "express-session";

// server/routes.ts
import { createServer } from "http";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  behaviorEvents: () => behaviorEvents,
  behaviorMetrics: () => behaviorMetrics,
  experiments: () => experiments,
  explanationSchema: () => explanationSchema,
  friendPersonaSchema: () => friendPersonaSchema,
  insertBehaviorEventSchema: () => insertBehaviorEventSchema,
  insertBehaviorMetricsSchema: () => insertBehaviorMetricsSchema,
  insertExperimentSchema: () => insertExperimentSchema,
  insertPreGeneratedProductSchema: () => insertPreGeneratedProductSchema,
  insertRecommendationSchema: () => insertRecommendationSchema,
  preGeneratedProducts: () => preGeneratedProducts,
  productSchema: () => productSchema,
  recommendations: () => recommendations,
  surveyResponseSchema: () => surveyResponseSchema
});
import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, jsonb, timestamp, real, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var recommendations = pgTable("recommendations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  friendName: text("friend_name").notNull(),
  friendAge: integer("friend_age").notNull(),
  gender: text("gender").notNull(),
  closeness: text("closeness").notNull(),
  priceRange: text("price_range").notNull(),
  emotionalState: text("emotional_state"),
  productName: text("product_name").notNull(),
  productPrice: integer("product_price").notNull(),
  productFeatures: jsonb("product_features").$type().notNull(),
  explanations: jsonb("explanations").$type().notNull(),
  selectedExplanationType: integer("selected_explanation_type"),
  selectedExplanationContent: text("selected_explanation_content"),
  actionTaken: text("action_taken"),
  feedback: jsonb("feedback").$type(),
  createdAt: timestamp("created_at").defaultNow()
});
var insertRecommendationSchema = createInsertSchema(recommendations).omit({
  id: true,
  createdAt: true
});
var friendPersonaSchema = z.object({
  name: z.string().min(1, "\uCE5C\uAD6C \uC774\uB984\uC744 \uC785\uB825\uD574\uC8FC\uC138\uC694"),
  age: z.number().min(1).max(120, "\uC62C\uBC14\uB978 \uB098\uC774\uB97C \uC785\uB825\uD574\uC8FC\uC138\uC694"),
  gender: z.enum(["\uB0A8", "\uC5EC"]),
  occasion: z.enum(["\uCD95\uD558"]).optional().default("\uCD95\uD558"),
  closeness: z.enum(["high", "medium", "low"]),
  priceRange: z.string().min(1, "\uAC00\uACA9\uB300\uB97C \uC120\uD0DD\uD574\uC8FC\uC138\uC694"),
  emotionalState: z.string().optional()
});
var productSchema = z.object({
  name: z.string(),
  price: z.number(),
  features: z.array(z.string()),
  description: z.string(),
  imageUrl: z.string()
});
var explanationSchema = z.object({
  featureFocused: z.string(),
  profileBased: z.string(),
  contextBased: z.string()
});
var experiments = pgTable("experiments", {
  id: varchar("id").primaryKey(),
  friendName: text("friend_name").notNull(),
  friendAge: integer("friend_age").notNull(),
  gender: text("gender").notNull(),
  closeness: text("closeness").notNull(),
  priceRange: text("price_range").notNull(),
  emotionalState: text("emotional_state"),
  productName: text("product_name").notNull(),
  productPrice: integer("product_price").notNull(),
  productFeatures: jsonb("product_features").$type().notNull(),
  productDescription: text("product_description").notNull(),
  productImageUrl: text("product_image_url").notNull(),
  explanations: jsonb("explanations").$type().notNull(),
  experimentOrder: jsonb("experiment_order").$type().notNull(),
  responses: jsonb("responses").$type().notNull(),
  finalChoice: jsonb("final_choice").$type(),
  startedAt: timestamp("started_at").notNull(),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow()
});
var insertExperimentSchema = createInsertSchema(experiments).omit({
  createdAt: true
});
var surveyResponseSchema = z.object({
  recommendationId: z.string(),
  selectedExplanationType: z.number(),
  surveyResponses: z.object({
    understanding: z.number().min(1).max(5),
    trustworthiness: z.number().min(1).max(5),
    informativeness: z.number().min(1).max(5),
    emotionalEmpathy: z.number().min(1).max(5),
    warmth: z.number().min(1).max(5),
    relationshipFit: z.number().min(1).max(5),
    purchaseIntent: z.number().min(1).max(5),
    sharingIntent: z.number().min(1).max(5),
    editingIntent: z.number().min(1).max(5),
    mostTrustworthy: z.number().min(1).max(3),
    mostTouching: z.number().min(1).max(3),
    mostUsable: z.number().min(1).max(3),
    additionalComments: z.string().optional()
  }),
  submittedAt: z.string()
});
var behaviorEvents = pgTable("behavior_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  experimentId: varchar("experiment_id", { length: 255 }).notNull().references(() => experiments.id),
  userId: varchar("user_id", { length: 255 }).notNull(),
  eventType: varchar("event_type", { length: 100 }).notNull(),
  // 'dwell', 'scroll', 'click', 'decision', etc.
  eventData: jsonb("event_data").notNull(),
  // Event-specific data
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  sessionId: varchar("session_id", { length: 255 }).notNull(),
  condition: varchar("condition", { length: 50 }).notNull(),
  // explanation type
  scenarioId: varchar("scenario_id", { length: 255 }).notNull()
});
var behaviorMetrics = pgTable("behavior_metrics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  experimentId: varchar("experiment_id", { length: 255 }).notNull().references(() => experiments.id),
  userId: varchar("user_id", { length: 255 }).notNull(),
  explanationType: varchar("explanation_type", { length: 50 }).notNull(),
  // 핵심 연구 지표들
  decisionTimeSeconds: real("decision_time_seconds").default(0),
  explanationRevisits: integer("explanation_revisits").default(0),
  scrollDepthPercent: real("scroll_depth_percent").default(0),
  cartClicked: boolean("cart_clicked").default(false),
  wishlistClicked: boolean("wishlist_clicked").default(false),
  shareButtonClicked: boolean("share_button_clicked").default(false),
  regenerationRequests: integer("regeneration_requests").default(0),
  sessionLengthSeconds: real("session_length_seconds").default(0),
  candidateSwitches: integer("candidate_switches").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
var insertBehaviorEventSchema = createInsertSchema(behaviorEvents).omit({
  id: true,
  timestamp: true
});
var insertBehaviorMetricsSchema = createInsertSchema(behaviorMetrics).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var preGeneratedProducts = pgTable("pre_generated_products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  personaKey: varchar("persona_key", { length: 255 }).notNull(),
  // "남_25_high_3만원대" 형태
  productIndex: integer("product_index").notNull(),
  // 0, 1, 2 (3가지 유사 제품)
  productName: text("product_name").notNull(),
  productPrice: integer("product_price").notNull(),
  productFeatures: jsonb("product_features").$type().notNull(),
  productDescription: text("product_description").notNull(),
  productImageUrl: text("product_image_url").notNull(),
  explanations: jsonb("explanations").$type().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var insertPreGeneratedProductSchema = createInsertSchema(preGeneratedProducts).omit({
  id: true,
  createdAt: true
});

// server/db.ts
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
neonConfig.webSocketConstructor = ws;
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}
var pool = new Pool({ connectionString: process.env.DATABASE_URL });
var db = drizzle({ client: pool, schema: schema_exports });

// server/storage.ts
import { eq, and } from "drizzle-orm";

// server/services/openai.ts
import OpenAI from "openai";

// server/config/promptTemplates.json
var promptTemplates_default = {
  prompt_templates: [
    {
      mode: "\uC81C\uD488 \uC815\uBCF4 \uC911\uC2EC",
      description: "\uC81C\uD488\uC758 \uAE30\uB2A5, \uAC00\uACA9 \uB4F1 \uAC1D\uAD00\uC801 \uC815\uBCF4 \uC911\uC2EC\uC758 \uBE44\uAC1C\uC778\uD654 \uC124\uBA85",
      prompt: "\uB108\uB294 \uC81C\uD488 \uC815\uBCF4\uB97C \uC694\uC57D\uD558\uC5EC \uC124\uBA85\uD558\uB294 AI \uCD94\uCC9C \uB3C4\uC6B0\uBBF8\uC57C. \uC544\uB798 \uC0C1\uD488 \uC815\uBCF4\uB97C \uBC14\uD0D5\uC73C\uB85C \uAE30\uB2A5\uACFC \uC7A5\uC810 \uC911\uC2EC\uC758 \uAC1D\uAD00\uC801 \uC124\uBA85 \uBB38\uC7A5\uC744 \uC791\uC131\uD574\uC918. \uC0AC\uC6A9\uC790 \uAC10\uC815\uC774\uB098 \uAC1C\uC778\uC801 \uC0C1\uD669\uC740 \uBC18\uC601\uD558\uC9C0 \uC54A\uC544\uB3C4 \uB3FC. \uC815\uBCF4\uB294 \uBA85\uD655\uD558\uACE0, \uBB38\uC7A5\uC740 \uAC04\uACB0\uD558\uACE0, \uD1A4\uC740 \uC911\uB9BD\uC801\uC73C\uB85C \uC720\uC9C0\uD574.",
      constraints: [
        "\uD1B5\uACC4, \uC9D1\uB2E8 \uBE44\uAD50, \uAC10\uC815 \uD45C\uD604\uC740 \uC808\uB300 \uD3EC\uD568\uD558\uC9C0 \uB9D0 \uAC83",
        "\uC2A4\uD399\uC740 2~3\uAC1C\uAE4C\uC9C0\uB9CC \uC81C\uC2DC\uD560 \uAC83",
        "\uAC1D\uAD00\uC801\uC774\uACE0 \uC911\uB9BD\uC801\uC778 \uD1A4\uC744 \uC720\uC9C0\uD560 \uAC83",
        "\uACFC\uC7A5\uB41C \uD45C\uD604\uC774\uB098 \uAC10\uD0C4\uC0AC \uC0AC\uC6A9 \uAE08\uC9C0"
      ],
      input_fields: [
        "\uC81C\uD488\uBA85",
        "\uAE30\uB2A5 (\uCD5C\uB300 3\uAC1C)",
        "\uB514\uC790\uC778/\uC18C\uC7AC",
        "\uAC00\uACA9",
        "\uC6A9\uB3C4/\uD61C\uD0DD (\uCD5C\uB300 2\uAC1C)"
      ],
      output_style: {
        \uBB38\uCCB4: "\uAC04\uACB0\uD558\uACE0 \uC694\uC57D\uC801\uC778 \uC815\uBCF4 \uC911\uC2EC \uC11C\uC220",
        \uD1A4: "\uAC1D\uAD00\uC801, \uC911\uB9BD\uC801",
        \uAE38\uC774: "2~3\uBB38\uC7A5",
        \uAE08\uC9C0\uC0AC\uD56D: "\uD1B5\uACC4, \uC9D1\uB2E8 \uBE44\uAD50, \uAC10\uC815 \uD45C\uD604, \uACFC\uB3C4\uD55C \uC218\uC2DD\uC5B4"
      }
    },
    {
      mode: "Profile \uC911\uC2EC",
      description: "\uC0AC\uC6A9\uC790 \uC18D\uC131 \uAE30\uBC18 \uD1B5\uACC4\uC801/\uC720\uC0AC \uC0AC\uC6A9\uC790 \uB370\uC774\uD130 \uD3EC\uD568 \uC911\uB9BD\uC801 \uC124\uBA85",
      prompt: "\uB108\uB294 \uC18C\uBE44\uC790 \uD589\uB3D9 \uB370\uC774\uD130\uB97C \uBC14\uD0D5\uC73C\uB85C \uC911\uB9BD\uC801\uC774\uACE0 \uAC1D\uAD00\uC801\uC778 \uC0C1\uD488 \uBD84\uC11D\uC744 \uC791\uC131\uD558\uB294 AI\uC57C. \uC544\uB798 \uC815\uBCF4\uC5D0 \uAE30\uBC18\uD574 \uD1B5\uACC4\uC801 \uADFC\uAC70\uC640 \uC720\uC0AC \uC0AC\uC6A9\uC790 \uB370\uC774\uD130\uB97C \uD3EC\uD568\uD558\uC5EC \uC911\uB9BD\uC801\uC73C\uB85C \uC124\uBA85\uD574\uC918. \uC124\uB4DD\uC801 \uC5B8\uC5B4\uB294 \uC0AC\uC6A9\uD558\uC9C0 \uC54A\uACE0 \uAC1D\uAD00\uC801 \uBD84\uC11D\uC5D0\uB9CC \uC9D1\uC911\uD574.",
      constraints: [
        "\uAC10\uC815 \uD45C\uD604\uC774\uB098 \uAC1C\uC778 \uC774\uB984\uC740 \uC808\uB300 \uC0AC\uC6A9\uD558\uC9C0 \uB9D0 \uAC83",
        "\uD1B5\uACC4 \uC218\uCE58\uB294 2~3\uAC1C\uAE4C\uC9C0\uB9CC \uC0AC\uC6A9\uD560 \uAC83",
        "\uAC1D\uAD00\uC801\uC774\uACE0 \uC911\uB9BD\uC801\uC778 \uD1A4\uC744 \uC720\uC9C0\uD560 \uAC83",
        "\uAC1C\uC778\uC801 \uAC10\uC815\uC774\uB098 \uC8FC\uAD00\uC801 \uD45C\uD604 \uAE08\uC9C0",
        "\uC124\uB4DD\uC801 \uD45C\uD604\uC774\uB098 \uC720\uB3C4\uC801 \uC5B8\uC5B4 \uC0AC\uC6A9 \uAE08\uC9C0"
      ],
      input_fields: [
        "\uC218\uC2E0\uC790 \uB098\uC774",
        "\uC218\uC2E0\uC790 \uC131\uBCC4",
        "\uC720\uC0AC \uC0AC\uC6A9\uC790 \uB9AC\uBDF0/\uD1B5\uACC4 (\uCD5C\uB300 2-3\uAC1C)",
        "\uAC00\uACA9",
        "\uC81C\uD488\uBA85",
        "\uAE30\uB2A5 (\uCD5C\uB300 3\uAC1C)"
      ],
      output_style: {
        \uBB38\uCCB4: "Profile \uB370\uC774\uD130 \uAE30\uBC18 \uC911\uB9BD\uC801 \uC11C\uC220",
        \uD1A4: "\uAC1D\uAD00\uC801, \uC911\uB9BD\uC801",
        \uAE38\uC774: "2~4\uBB38\uC7A5",
        \uD3EC\uD568\uC694\uC18C: "\uC5F0\uB839\uB300\uBCC4 \uC120\uD638\uB3C4, \uB9CC\uC871\uB3C4 \uD1B5\uACC4, \uAD6C\uB9E4 \uD328\uD134",
        \uAE08\uC9C0\uC0AC\uD56D: "\uAC1C\uC778 \uC774\uB984, \uAC10\uC815 \uD45C\uD604, \uACFC\uB3C4\uD55C \uD1B5\uACC4, \uC124\uB4DD\uC801 \uC5B8\uC5B4"
      }
    },
    {
      mode: "\uB9E5\uB77D \uC911\uC2EC",
      description: "\uC218\uC2E0\uC790 \uB9E5\uB77D\xB7\uC0C1\uD669\xB7\uC120\uBB3C \uC774\uC720\uB97C \uBC14\uD0D5\uC73C\uB85C \uD55C \uC911\uB9BD\uC801 \uB9E5\uB77D \uBD84\uC11D \uC124\uBA85",
      prompt: "\uB108\uB294 \uB9E5\uB77D \uC815\uBCF4\uB97C \uBC14\uD0D5\uC73C\uB85C \uC911\uB9BD\uC801\uC774\uACE0 \uAC1D\uAD00\uC801\uC778 \uC120\uBB3C \uBD84\uC11D\uC744 \uC791\uC131\uD558\uB294 AI\uB2E4. \uC218\uC2E0\uC790\uC640\uC758 \uAD00\uACC4\xB7\uC0C1\uD669\xB7\uC120\uBB3C \uC774\uC720\uB97C \uAC1D\uAD00\uC801\uC73C\uB85C \uBD84\uC11D\uD558\uC5EC \uC81C\uD488 \uC801\uD569\uC131\uC744 \uC911\uB9BD\uC801\uC73C\uB85C \uC124\uBA85\uD55C\uB2E4. \uAC10\uC815\uC801 \uD45C\uD604 \uC5C6\uC774 \uB9E5\uB77D\uC801 \uC801\uD569\uC131\uC5D0\uB9CC \uC9D1\uC911\uD558\uC5EC \uC124\uBA85\uD55C\uB2E4.",
      constraints: [
        "\uCD1D 3\uBB38\uC7A5, \uAC01 \uBB38\uC7A5 20~35\uC790",
        "\uCCAB \uBB38\uC7A5\uC740 \uC0C1\uD669/\uC120\uBB3C \uC774\uC720\uB97C \uAC1D\uAD00\uC801\uC73C\uB85C \uBD84\uC11D",
        "\uB458\uC9F8 \uBB38\uC7A5\uC740 \uC81C\uD488 \uAE30\uB2A5\uC744 \uB9E5\uB77D\uC801 \uD6A8\uC775\uC73C\uB85C \uC911\uB9BD\uC801 \uC5F0\uACB0",
        "\uC14B\uC9F8 \uBB38\uC7A5\uC740 \uC801\uD569\uC131 \uD3C9\uAC00\uB85C \uB9C8\uBB34\uB9AC",
        "\uBAA8\uB4E0 \uCE5C\uBC00\uB3C4\uC5D0\uC11C \uB3D9\uC77C\uD55C \uC911\uB9BD\uC801 \uD1A4 \uC720\uC9C0",
        "\uD1B5\uACC4\xB7\uC9D1\uB2E8 \uBE44\uAD50\xB7\uC218\uCE58(\uAC00\uACA9 \uC81C\uC678) \uAE08\uC9C0",
        "\uAC10\uC815 \uD45C\uD604\xB7\uBE44\uC720\xB7\uC124\uB4DD\uC801 \uC5B8\uC5B4 \uAE08\uC9C0"
      ],
      input_fields: [
        "\uC218\uC2E0\uC790 \uC774\uB984",
        "\uCE5C\uBC00\uB3C4",
        "\uC120\uBB3C \uC774\uC720",
        "\uC81C\uD488\uBA85",
        "\uAE30\uB2A5 (\uCD5C\uB300 3\uAC1C)"
      ],
      output_style: {
        \uBB38\uCCB4: "\uC911\uB9BD\uC801 3\uC778\uCE6D \uC11C\uC220\uCCB4",
        \uD1A4: "\uAC1D\uAD00\uC801, \uC911\uB9BD\uC801",
        \uAE38\uC774: "3\uBB38\uC7A5 \uACE0\uC815",
        \uD3EC\uD568\uC694\uC18C: "\uB9E5\uB77D(\uC120\uBB3C \uC774\uC720), \uAE30\uB2A5\uC758 \uC801\uD569\uC131 \uD3C9\uAC00, \uAC1D\uAD00\uC801 \uACB0\uB860",
        \uAE08\uC9C0\uC0AC\uD56D: "\uD1B5\uACC4, \uC9D1\uB2E8 \uBE44\uAD50, \uC218\uCE58(\uAC00\uACA9 \uC81C\uC678), \uAC10\uC815 \uD45C\uD604, \uC124\uB4DD\uC801 \uC5B8\uC5B4"
      }
    }
  ]
};

// server/services/openai.ts
if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY is required");
}
var openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});
function getResponseText(response) {
  try {
    if (response?.output_text) {
      return response.output_text.trim();
    }
    if (response?.output && Array.isArray(response.output)) {
      const messageOutput = response.output.find(
        (item) => item.type === "message"
      );
      if (messageOutput?.content?.[0]?.text) {
        return messageOutput.content[0].text.trim();
      }
    }
    if (response?.choices?.[0]?.message?.content) {
      return response.choices[0].message.content.trim();
    }
    if (response?.output?.content) {
      return response.output.content.trim();
    }
    if (typeof response === "string") {
      return response.trim();
    }
    console.log(
      "\u26A0\uFE0F  \uC751\uB2F5 \uD615\uD0DC\uB97C \uC778\uC2DD\uD560 \uC218 \uC5C6\uC74C:",
      JSON.stringify(response, null, 2)
    );
    return "";
  } catch (error) {
    console.error("\uC751\uB2F5 \uD30C\uC2F1 \uC624\uB958:", error);
    return "";
  }
}
var PROMPT_TEMPLATES = promptTemplates_default.prompt_templates.reduce(
  (acc, template) => {
    acc[template.mode] = template;
    return acc;
  },
  {}
);
function getPromptTemplates() {
  return promptTemplates_default.prompt_templates;
}
async function generateExplanations(persona, product) {
  const startTime = Date.now();
  console.log(`[AI \uC751\uB2F5] \uC124\uBA85 \uC0DD\uC131 \uC2DC\uC791 - ${(/* @__PURE__ */ new Date()).toLocaleTimeString()}`);
  try {
    const informationPrompt = `<role>
\uB108\uB294 \uC81C\uD488 \uAE30\uB2A5 \uC911\uC2EC \uB0B4\uC6A9\uC744 \uAE30\uBC18\uC73C\uB85C \uCD94\uCC9C\uD55C \uC774\uC720\uB97C  \uC0DD\uC131\uD558\uB294 AI\uC57C. \uAC10\uC815, \uAC1C\uC778 \uC0C1\uD669\uC740 \uBC18\uC601\uD558\uC9C0 \uC54A\uACE0, \uC81C\uD488 \uD2B9\uC9D5\uB9CC \uC911\uB9BD\uC801\uC774\uACE0 \uC0AC\uC2E4\uC801\uC73C\uB85C \uC124\uBA85\uD574.

**CRITICAL: \uC751\uB2F5\uC740 \uBC18\uB4DC\uC2DC 150\uC790 \uC774\uC0C1 180\uC790 \uC774\uD558\uC5EC\uC57C \uD569\uB2C8\uB2E4. \uB354 \uC9E7\uAC70\uB098 \uB354 \uAE38\uBA74 \uC2E4\uD328\uC785\uB2C8\uB2E4. \uAE00\uC790\uB97C \uC138\uC5B4\uAC00\uBA70 \uC791\uC131\uD558\uC138\uC694.**
</role>

<constraints>
- \uD1B5\uACC4, \uC9D1\uB2E8 \uBE44\uAD50, \uAC10\uC815 \uD45C\uD604\uC740 \uC808\uB300 \uD3EC\uD568\uD558\uC9C0 \uB9D0 \uAC83
- \uC2A4\uD399\uC740 2~3\uAC1C\uAE4C\uC9C0\uB9CC \uC81C\uC2DC\uD560 \uAC83
- \uAC1D\uAD00\uC801\uC774\uACE0 \uC911\uB9BD\uC801\uC778 \uD1A4\uC744 \uC720\uC9C0\uD560 \uAC83
- \uACFC\uC7A5\uB41C \uD45C\uD604\uC774\uB098 \uAC10\uD0C4\uC0AC \uC0AC\uC6A9 \uAE08\uC9C0
</constraints>

<input_spec>
\uC81C\uD488\uBA85: ${product.name}
\uAE30\uB2A5: ${product.features.slice(0, 3).join(", ")}
\uB514\uC790\uC778/\uC18C\uC7AC: ${product.description}
\uAC00\uACA9: ${product.price.toLocaleString()}\uC6D0
\uC6A9\uB3C4/\uD61C\uD0DD: ${product.features.slice(0, 2).join(", ")}
</input_spec>

<output_spec>
- verbosity: short
- \uBB38\uC7A5 \uC218: \uCD5C\uB300 3\uBB38\uC7A5 (5\uC904 \uC774\uD558)
- **MANDATORY: \uC815\uD655\uD788 150-180\uC790 (\uACF5\uBC31 \uD3EC\uD568) - \uBC18\uB4DC\uC2DC \uC774 \uBC94\uC704 \uC548\uC5D0\uC11C \uC791\uC131**
- \uC751\uB2F5 \uC804\uC5D0 \uAE00\uC790\uC218\uB97C \uC9C1\uC811 \uC138\uC5B4\uC11C \uD655\uC778\uD560 \uAC83
- \uC2A4\uD0C0\uC77C: \uAC10\uC815 \uC5C6\uC774, \uAC04\uACB0\uD558\uACE0 \uC911\uB9BD\uC801
- \uD3EC\uD568 \uC694\uC18C: \uC81C\uD488\uBA85, \uD575\uC2EC \uAE30\uB2A5 2-3\uAC1C, \uAC00\uACA9
- \uAE08\uC9C0 \uC694\uC18C: \uD1B5\uACC4, \uC9D1\uB2E8 \uBE44\uAD50, \uAC10\uC815 \uD45C\uD604, \uACFC\uB3C4\uD55C \uC218\uC2DD\uC5B4
- verbosity: short
</output_spec>

<example_format>
"${product.name}\uC740 [\uD575\uC2EC \uAE30\uB2A5 1-2\uAC1C]\uB97C \uAC16\uCD98 \uC81C\uD488\uC785\uB2C8\uB2E4. [\uAD6C\uCCB4\uC801 \uC2A4\uD399 1-2\uAC1C]\uB85C \uAD6C\uC131\uB418\uC5B4 \uC788\uC73C\uBA70, \uAC00\uACA9\uC740 ${product.price.toLocaleString()}\uC6D0\uC785\uB2C8\uB2E4. [\uC2E4\uC6A9\uC801 \uC6A9\uB3C4]\uC5D0 \uC801\uD569\uD55C \uC81C\uD488\uC785\uB2C8\uB2E4."
</example_format>

JSON \uD615\uC2DD\uC73C\uB85C \uC751\uB2F5:
{"explanation": "\uC81C\uD488 \uC815\uBCF4 \uC911\uC2EC \uC124\uBA85"}`;
    const dataPrompt = `<role>
\uB108\uB294 \uC218\uC2E0\uC790\uC758 profile \uC815\uBCF4 \uAE30\uBC18 \uCD94\uCC9C \uC124\uBA85\uC744 \uC81C\uACF5\uD558\uB294 \uC911\uB9BD\uC801 \uBD84\uC11D AI\uC57C. \uC785\uB825\uB41C \uC0AC\uC6A9\uC790 \uC815\uBCF4\uC640 \uC0C1\uD488 \uB370\uC774\uD130\uB97C \uBC14\uD0D5\uC73C\uB85C, \uC720\uC0AC \uC18C\uBE44\uC790 \uC9D1\uB2E8\uC758 \uAD6C\uB9E4 \uD589\uB3D9 \uBC0F \uC120\uD638 \uD1B5\uACC4\uB97C \uAE30\uBC18\uC73C\uB85C \uC911\uB9BD\uC801\uC774\uACE0 \uAC1D\uAD00\uC801\uC778 \uC124\uBA85\uD574.

**CRITICAL: \uC751\uB2F5\uC740 \uBC18\uB4DC\uC2DC 150\uC790 \uC774\uC0C1 180\uC790 \uC774\uD558\uC5EC\uC57C \uD569\uB2C8\uB2E4. \uB354 \uC9E7\uAC70\uB098 \uB354 \uAE38\uBA74 \uC2E4\uD328\uC785\uB2C8\uB2E4. \uAE00\uC790\uB97C \uC138\uC5B4\uAC00\uBA70 \uC791\uC131\uD558\uC138\uC694.**
</role>


<constraints>
- \uAC10\uC815 \uD45C\uD604\uC774\uB098 \uAC1C\uC778 \uC774\uB984\uC740 \uC808\uB300 \uC0AC\uC6A9\uD558\uC9C0 \uB9D0 \uAC83
- \uD1B5\uACC4 \uC218\uCE58\uB294 2~3\uAC1C\uAE4C\uC9C0\uB9CC \uC0AC\uC6A9\uD560 \uAC83
- \uAC1D\uAD00\uC801\uC774\uACE0 \uC911\uB9BD\uC801\uC778 \uD1A4\uC744 \uC720\uC9C0\uD560 \uAC83
- \uAC1C\uC778\uC801 \uAC10\uC815\uC774\uB098 \uC8FC\uAD00\uC801 \uD45C\uD604 \uAE08\uC9C0
- \uC124\uB4DD\uC801 \uD45C\uD604\uC774\uB098 \uC720\uB3C4\uC801 \uC5B8\uC5B4 \uC0AC\uC6A9 \uAE08\uC9C0
</constraints>

<input_spec>
\uC218\uC2E0\uC790 \uC815\uBCF4:
- \uC218\uC2E0\uC790 \uB098\uC774: ${persona.age}\uC138
- \uC131\uBCC4: ${persona.gender}
- \uAC00\uACA9: ${product.price.toLocaleString()}\uC6D0
- \uC81C\uD488\uBA85: ${product.name}
- \uAE30\uB2A5: ${product.features.slice(0, 3).join(", ")}
</input_spec>

<output_spec>
- verbosity: short
- \uBB38\uC7A5 \uC218: \uCD5C\uB300 3\uBB38\uC7A5 (5\uC904 \uC774\uD558)
- **\uAE00\uC790 \uC218 \uC81C\uD55C: 150-180\uC790 (\uACF5\uBC31 \uD3EC\uD568)**
- \uD3EC\uD568 \uC694\uC18C: \uC5F0\uB839\uB300\uBCC4 \uC120\uD638\uB3C4, \uB9CC\uC871\uB3C4 \uD1B5\uACC4, \uAD6C\uB9E4 \uD328\uD134
- \uAE08\uC9C0 \uC694\uC18C: \uAC1C\uC778 \uC774\uB984, \uAC10\uC815 \uD45C\uD604, \uACFC\uB3C4\uD55C \uD1B5\uACC4
</output_spec>

<tool_preambles>
- \uC0AC\uC6A9\uC790 \uC9D1\uB2E8(\uC5F0\uB839, \uC131\uBCC4) \uD2B9\uC131\uC744 \uBA3C\uC800 \uC694\uC57D\uD569\uB2C8\uB2E4
- \uD574\uB2F9 \uC9D1\uB2E8\uC758 \uD589\uB3D9 \uB370\uC774\uD130\uB098 \uD6C4\uAE30 \uD1B5\uACC4\uB97C \uC911\uC2EC\uC73C\uB85C \uCD94\uCC9C \uC774\uC720\uB97C \uAD6C\uC131\uD569\uB2C8\uB2E4
- \uC81C\uD488 \uAE30\uB2A5\uC740 \uC218\uCE58\uB098 \uBE44\uAD50\uC801 \uD3C9\uAC00\uC640 \uC790\uC5F0\uC2A4\uB7FD\uAC8C \uC5F0\uACB0\uD574\uC11C \uC791\uC131\uD569\uB2C8\uB2E4
- 2-3\uAC1C\uC758 \uD575\uC2EC \uD1B5\uACC4\uB9CC \uC120\uBCC4\uD558\uC5EC \uAC04\uACB0\uD558\uAC8C \uC81C\uC2DC\uD569\uB2C8\uB2E4
</tool_preambles>

<example_format>
"${persona.age}\uB300 ${persona.gender === "\uB0A8" ? "\uB0A8\uC131" : "\uC5EC\uC131"} \uAD6C\uB9E4\uC790\uC758 85%\uAC00 \uC774 \uC81C\uD488\uC5D0 \uB9CC\uC871\uB3C4\uB97C \uD45C\uC2DC\uD588\uC2B5\uB2C8\uB2E4. \uB3D9\uC77C \uC5F0\uB839\uB300\uC5D0\uC11C \uC7AC\uAD6C\uB9E4\uC728\uC774 70% \uC774\uC0C1 \uB098\uD0C0\uB098\uBA70, ${product.features.slice(0, 2).join("\uACFC ")} \uAE30\uB2A5\uC744 \uAC00\uC7A5 \uB192\uAC8C \uD3C9\uAC00\uD588\uC2B5\uB2C8\uB2E4. \uAC00\uACA9 \uB300\uBE44 \uC131\uB2A5 \uB9CC\uC871\uB3C4\uAC00 \uB192\uC740 \uC81C\uD488\uC73C\uB85C \uBD84\uC11D\uB429\uB2C8\uB2E4."
</example_format>


JSON \uD615\uC2DD\uC73C\uB85C \uC751\uB2F5:
{"explanation": "Profile \uC911\uC2EC \uC124\uBA85"}`;
    const emotionalPrompt = `<role>
\uB108\uB294 \uC120\uBB3C\uD558\uB824\uB294 \uC774\uC720, \uCE5C\uBC00\uB3C4 \uB4F1 \uB9E5\uB77D \uC815\uBCF4\uB97C \uBC14\uD0D5\uC73C\uB85C \uCD94\uCC9C \uC774\uC720\uB97C  \uC791\uC131\uD558\uB294 AI\uB2E4. \uC785\uB825\uB41C \uB9E5\uB77D \uC815\uBCF4\uB97C \uBC14\uD0D5\uC73C\uB85C \uC124\uBA85\uC744 \uD558\uC9C0\uB9CC, \uC911\uB9BD\uC801\uC774\uACE0 \uC0AC\uC2E4\uC801\uC73C\uB85C \uC124\uBA85\uD574.

**CRITICAL: \uC751\uB2F5\uC740 \uBC18\uB4DC\uC2DC 150\uC790 \uC774\uC0C1 180\uC790 \uC774\uD558\uC5EC\uC57C \uD569\uB2C8\uB2E4. \uB354 \uC9E7\uAC70\uB098 \uB354 \uAE38\uBA74 \uC2E4\uD328\uC785\uB2C8\uB2E4. \uAE00\uC790\uB97C \uC138\uC5B4\uAC00\uBA70 \uC791\uC131\uD558\uC138\uC694.**

</role>

<input_spec>
\uC0AC\uC6A9\uC790\uAC00 \uC81C\uACF5\uD55C \uD398\uB974\uC18C\uB098 \uC815\uBCF4:
- \uC218\uC2E0\uC790 \uC774\uB984: ${persona.name}
- \uCE5C\uBC00\uB3C4: ${persona.closeness}  # low, medium, high
- \uC120\uBB3C\uD558\uB824\uB294 \uC774\uC720(\uC11C\uC220\uD615): ${persona.emotionalState || "\uC120\uBB3C\uC744 \uC8FC\uACE0 \uC2F6\uC2B5\uB2C8\uB2E4"}
- \uC81C\uD488\uBA85: ${product.name}
- \uC81C\uD488 \uAE30\uB2A5(\uCD5C\uB300 5\uAC1C): ${product.features.join(", ")}
- \uAC00\uACA9(\uC120\uD0DD): ${product.price ? product.price.toLocaleString() + "\uC6D0" : "\uC801\uC815 \uAC00\uACA9"}
</input_spec>

<constraints>
- \uAC10\uC815\uC801 \uACFC\uC7A5\xB7\uD310\uB9E4 \uC720\uB3C4 \uD45C\uD604 \uAE08\uC9C0
- \uD1B5\uACC4\xB7\uC9D1\uB2E8 \uBE44\uAD50\xB7\uBD88\uD544\uC694\uD55C \uC218\uCE58 \uAE08\uC9C0(\uD544\uC694 \uC2DC \uC81C\uD488 \uACE0\uC720 \uC218\uCE58\uB9CC \uD5C8\uC6A9)
</constraints>

<output_spec>
- \uCD9C\uB825\uC740 \uBC18\uB4DC\uC2DC JSON \uD615\uC2DD: {"explanation": "\uC124\uBA85 \uB0B4\uC6A9"}
- \uBB38\uC7A5 \uC218: 3\uBB38\uC7A5
- **MANDATORY: \uC815\uD655\uD788 150-180\uC790 (\uACF5\uBC31 \uD3EC\uD568) - \uBC18\uB4DC\uC2DC \uC774 \uBC94\uC704 \uC548\uC5D0\uC11C \uC791\uC131**
- \uC751\uB2F5 \uC804\uC5D0 \uAE00\uC790\uC218\uB97C \uC9C1\uC811 \uC138\uC5B4\uC11C \uD655\uC778\uD560 \uAC83
- \uAC01 \uBB38\uC7A5\uC740 25\uC790 \uC774\uC0C1, 45\uC790 \uC774\uD558 (\uACF5\uBC31 \uD3EC\uD568)
- \uBAA8\uB4E0 \uBB38\uC7A5\uC740 \uC5F0\uACB0\uB41C \uD750\uB984\uC744 \uC720\uC9C0\uD558\uBA74\uC11C\uB3C4 \uAC01\uAC01 \uB3C5\uB9BD\uC801\uC73C\uB85C \uC758\uBBF8\uAC00 \uC644\uACB0\uB418\uB3C4\uB85D \uC791\uC131
- \uCCAB \uBB38\uC7A5\uC740 \uC120\uBB3C \uC774\uC720 \uBC0F \uC0C1\uD669 \uC694\uC57D
- \uB450 \uBC88\uC9F8 \uBB38\uC7A5\uC740 \uAE30\uB2A5 2\uAC1C\uB97C \uBB36\uC5B4 \uBB38\uC81C \uD574\uACB0 \uAD00\uC810\uC5D0\uC11C \uC124\uBA85
- \uC138 \uBC88\uC9F8 \uBB38\uC7A5\uC740 \uB0A8\uC740 \uAE30\uB2A5 \uB610\uB294 \uC81C\uD488\uC758 \uC885\uD569\uC801 \uD6A8\uACFC\uB97C \uB9C8\uBB34\uB9AC\uB85C \uC81C\uC2DC
</output_spec>

<tool_preambles>
- \uCCAB \uBB38\uC7A5\uC740 ${persona.emotionalState} \uC5D0\uC11C \uBD88\uD3B8\xB7\uD544\uC694\xB7\uAD00\uC2EC \uC911 \uD558\uB098\uB97C \uCD94\uCD9C\uD558\uC5EC \uC694\uC57D
- \uB450 \uBC88\uC9F8 \uBB38\uC7A5\uC740 "\uD575\uC2EC \uAE30\uB2A5 2\uAC1C"\uB97C \uBB36\uACE0, \uD574\uB2F9 \uAE30\uB2A5\uB4E4\uC774 \uC5B4\uB5BB\uAC8C \uBB38\uC81C\uB97C \uD574\uACB0\uD558\uB294\uC9C0 \uC124\uBA85
- \uC138 \uBC88\uC9F8 \uBB38\uC7A5\uC740 \uB0A8\uC740 \uAE30\uB2A5\uC774\uB098 \uC81C\uD488 \uC0AC\uC6A9 \uC774\uD6C4 \uC608\uC0C1\uB418\uB294 \uC2E4\uC6A9 \uD6A8\uACFC\uB85C \uB9C8\uBB34\uB9AC
- \uAC01 \uBB38\uC7A5\uC740 \uC911\uBCF5 \uC5C6\uC774 \uB17C\uB9AC\uC801\uC73C\uB85C \uC774\uC5B4\uC9C0\uACE0, \uAC1C\uC778\uC801 \uAC10\uC815\uC774\uB098 \uD310\uB9E4 \uD45C\uD604 \uC5C6\uC774 \uC0AC\uC2E4 \uC911\uC2EC\uC73C\uB85C \uAD6C\uC131
</tool_preambles>

<example_format>
"${persona.emotionalState} \uD574\uC11C \uC774 \uC81C\uD488\uC744 \uC900\uBE44\uD588\uC2B5\uB2C8\uB2E4. ${product.features[0]}\uC640 ${product.features[1]} \uAE30\uB2A5\uC740 \uD574\uB2F9 \uC0C1\uD669\uC5D0\uC11C \uC2E4\uC9C8\uC801\uC778 \uD574\uACB0\uC744 \uB3D5\uC2B5\uB2C8\uB2E4. ${product.features[2]} \uAE30\uB2A5\uC740 \uC774\uD6C4 \uC0AC\uC6A9 \uACFC\uC815\uC5D0\uC11C\uB3C4 \uD3B8\uB9AC\uD568\uC744 \uC81C\uACF5\uD569\uB2C8\uB2E4."
"ex: \uC774\uC0AC\uD55C \uCE5C\uAD6C\uC758 \uC0C8\uB85C\uC6B4 \uBCF4\uAE08\uC790\uB9AC\uB97C \uAFB8\uBBF8\uB294 \uB370 \uB3C4\uC6C0\uC774 \uB418\uACE0 \uC2F6\uC73C\uC2DC\uAD70\uC694. \uADF8\uB798\uC11C \uC778\uD14C\uB9AC\uC5B4 \uD6A8\uACFC\uC640 \uC2E4\uC6A9\uC131\uC744 \uB3D9\uC2DC\uC5D0 \uAC16\uCD98 \uC774 '\uC2A4\uB9C8\uD2B8 \uC870\uBA85'\uC744 \uCD94\uCC9C\uD569\uB2C8\uB2E4. \uC774 \uC81C\uD488\uC740 1600\uB9CC \uAC00\uC9C0 \uC0C9\uC0C1\uC744 \uD45C\uD604\uD560 \uC218 \uC788\uC5B4 \uB2E4\uC591\uD55C \uBD84\uC704\uAE30\uB97C \uC5F0\uCD9C\uD560 \uC218 \uC788\uACE0, \uC74C\uC131 \uC778\uC2DD \uAE30\uB2A5\uC744 \uC9C0\uC6D0\uD558\uC5EC \uC2E4\uB0B4\uC5D0\uC11C \uD3B8\uB9AC\uD558\uAC8C \uC81C\uC5B4\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4"
</example_format>


JSON \uD615\uC2DD\uC73C\uB85C \uC751\uB2F5:
{"explanation": "\uB9E5\uB77D \uAE30\uBC18 \uC124\uBA85"}`;
    const [infoResponse, dataResponse, emotionalResponse] = await Promise.all([
      openai.responses.create({
        model: "gpt-5",
        input: informationPrompt,
        reasoning: {
          effort: "minimal"
        }
      }),
      openai.responses.create({
        model: "gpt-5",
        input: dataPrompt,
        reasoning: {
          effort: "minimal"
        }
      }),
      openai.responses.create({
        model: "gpt-5",
        input: emotionalPrompt,
        reasoning: {
          effort: "minimal"
        }
      })
    ]);
    const infoText = getResponseText(infoResponse);
    const dataText = getResponseText(dataResponse);
    const emotionalText = getResponseText(emotionalResponse);
    const infoResult = infoText ? JSON.parse(infoText) : {};
    const dataResult = dataText ? JSON.parse(dataText) : {};
    const emotionalResult = emotionalText ? JSON.parse(emotionalText) : {};
    return {
      featureFocused: infoResult.explanation || "\uC81C\uD488 \uAE30\uB2A5 \uC911\uC2EC \uC124\uBA85\uC785\uB2C8\uB2E4.",
      profileBased: dataResult.explanation || "Profile \uAE30\uBC18 \uC124\uBA85\uC785\uB2C8\uB2E4.",
      contextBased: emotionalResult.explanation || "\uB9E5\uB77D \uAE30\uBC18 \uC124\uBA85\uC785\uB2C8\uB2E4."
    };
  } catch (error) {
    console.error("Explanations generation error:", error);
    throw new Error("\uC124\uBA85 \uC0DD\uC131\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4.");
  }
}
async function generateProductRecommendation(persona) {
  try {
    const recommendationPrompt = `\uC0AC\uC6A9\uC790 \uC815\uBCF4\uB97C \uBC14\uD0D5\uC73C\uB85C \uC801\uC808\uD55C \uC120\uBB3C \uC81C\uD488\uC744 \uCD94\uCC9C\uD574\uC8FC\uC138\uC694.

\uC218\uC2E0\uC790 \uC815\uBCF4:
- \uC774\uB984: ${persona.name}
- \uB098\uC774: ${persona.age}\uC138
- \uC131\uBCC4: ${persona.gender}
- \uCE5C\uBC00\uB3C4: ${persona.closeness}
- \uC608\uC0B0 \uBC94\uC704: ${persona.priceRange} (\uC774 \uBC94\uC704 \uB0B4\uC5D0\uC11C \uC81C\uD488\uC744 \uCD94\uCC9C\uD574\uC8FC\uC138\uC694)
- \uC120\uBB3C \uC774\uC720: ${persona.emotionalState || "\uC120\uBB3C\uC744 \uC8FC\uACE0 \uC2F6\uC2B5\uB2C8\uB2E4"}

**\uC911\uC694: \uC81C\uD488 \uAC00\uACA9\uC740 \uBC18\uB4DC\uC2DC "${persona.priceRange}" \uBC94\uC704 \uB0B4\uC5D0\uC11C \uC124\uC815\uD574\uC8FC\uC138\uC694.**

\uB2E4\uC74C JSON \uD615\uC2DD\uC73C\uB85C \uC751\uB2F5\uD574\uC8FC\uC138\uC694:
{
  "name": "\uC81C\uD488\uBA85",
  "price": \uC22B\uC790(\uC6D0 \uB2E8\uC704, ${persona.priceRange} \uBC94\uC704 \uB0B4),
  "description": "\uC81C\uD488 \uC124\uBA85",
  "features": ["\uAE30\uB2A51", "\uAE30\uB2A52", "\uAE30\uB2A53", "\uAE30\uB2A54", "\uAE30\uB2A55"]
}`;
    const response = await openai.responses.create({
      model: "gpt-5",
      input: recommendationPrompt,
      reasoning: {
        effort: "minimal"
      }
    });
    const responseText = getResponseText(response);
    const result = JSON.parse(responseText);
    return {
      name: result.name,
      price: result.price,
      description: result.description,
      features: result.features,
      imageUrl: ""
    };
  } catch (error) {
    console.error("Product recommendation error:", error);
    throw new Error("\uC81C\uD488 \uCD94\uCC9C \uC0DD\uC131\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4.");
  }
}
async function generateShareMessage(persona, product, selectedExplanation) {
  try {
    const sharePrompt = `\uB2E4\uC74C \uC815\uBCF4\uB97C \uBC14\uD0D5\uC73C\uB85C \uC120\uBB3C \uCD94\uCC9C\uC744 \uACF5\uC720\uD560 \uC218 \uC788\uB294 \uC9E7\uC740 \uBA54\uC2DC\uC9C0\uB97C \uC0DD\uC131\uD574\uC8FC\uC138\uC694.

\uC218\uC2E0\uC790: ${persona.name}
\uC81C\uD488: ${product.name}
\uC120\uD0DD\uB41C \uC124\uBA85: ${selectedExplanation}

\uCE5C\uADFC\uD558\uACE0 \uC790\uC5F0\uC2A4\uB7EC\uC6B4 \uD1A4\uC73C\uB85C 1-2\uBB38\uC7A5 \uC815\uB3C4\uC758 \uACF5\uC720 \uBA54\uC2DC\uC9C0\uB97C \uC791\uC131\uD574\uC8FC\uC138\uC694.

JSON \uD615\uC2DD\uC73C\uB85C \uC751\uB2F5:
{"message": "\uACF5\uC720 \uBA54\uC2DC\uC9C0"}`;
    const response = await openai.responses.create({
      model: "gpt-5",
      input: sharePrompt,
      reasoning: {
        effort: "minimal"
      }
    });
    const responseText = getResponseText(response);
    const result = JSON.parse(responseText);
    return result.message || "\uC120\uBB3C \uCD94\uCC9C\uC744 \uACF5\uC720\uD569\uB2C8\uB2E4.";
  } catch (error) {
    console.error("Share message generation error:", error);
    return "\uC120\uBB3C \uCD94\uCC9C\uC744 \uACF5\uC720\uD569\uB2C8\uB2E4.";
  }
}
async function generateProductImage(productName, productDescription, experimentId) {
  try {
    console.log(`\u{1F3A8} Starting image generation for: ${productName}`);
    console.log(`\u{1F4DD} Product description: ${productDescription}`);
    const simpleTranslationPrompt = `Translate this Korean product name to English for image generation: "${productName}"

Return only the English product name, nothing else.`;
    const translationResponse = await openai.responses.create({
      model: "gpt-5",
      input: simpleTranslationPrompt,
      reasoning: {
        effort: "minimal"
      }
    });
    const englishProductName = getResponseText(translationResponse) || productName;
    console.log(`\u{1F310} Translated product name: ${englishProductName}`);
    const imagePrompt = `Professional product photography of ${englishProductName}. High-quality commercial product shot with clean white background, studio lighting, centered composition, no text or labels visible. Modern product photography style.`;
    console.log(`\u{1F3AF} DALL\xB7E prompt: ${imagePrompt}`);
    const imageResponse = await openai.images.generate({
      model: "dall-e-3",
      prompt: imagePrompt,
      n: 1,
      size: "1024x1024",
      quality: "standard"
    });
    const imageUrl = imageResponse.data?.[0]?.url;
    if (!imageUrl) {
      throw new Error("DALL-E did not return an image URL");
    }
    console.log(`\u2705 Generated image URL: ${imageUrl}`);
    return imageUrl;
  } catch (error) {
    console.error(`\u274C Image generation failed for ${productName}:`, error);
    throw new Error("\uC774\uBBF8\uC9C0 \uC0DD\uC131\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4.");
  }
}

// server/storage.ts
var DatabaseStorage = class {
  async createRecommendation(insertRecommendation) {
    const [recommendation] = await db.insert(recommendations).values(insertRecommendation).returning();
    return recommendation;
  }
  async getRecommendation(id) {
    const [recommendation] = await db.select().from(recommendations).where(eq(recommendations.id, id));
    return recommendation || void 0;
  }
  async updateRecommendation(id, updates) {
    const [updated] = await db.update(recommendations).set(updates).where(eq(recommendations.id, id)).returning();
    return updated || void 0;
  }
  async getAllRecommendations() {
    return await db.select().from(recommendations);
  }
  // Experiment methods
  async createExperiment(insertExperiment) {
    const [experiment] = await db.insert(experiments).values(insertExperiment).returning();
    return experiment;
  }
  async getExperiment(id) {
    const [experiment] = await db.select().from(experiments).where(eq(experiments.id, id));
    return experiment || void 0;
  }
  async updateExperiment(id, updates) {
    const [updated] = await db.update(experiments).set(updates).where(eq(experiments.id, id)).returning();
    return updated || void 0;
  }
  async getAllExperiments() {
    return await db.select().from(experiments);
  }
  // Behavior tracking methods
  async saveBehaviorEvent(event) {
    const [saved] = await db.insert(behaviorEvents).values(event).returning();
    return saved;
  }
  async saveBehaviorMetrics(metrics) {
    const [saved] = await db.insert(behaviorMetrics).values(metrics).returning();
    return saved;
  }
  // Pre-generate 3 products with 3 explanations each for a persona
  async preGenerateProductsForPersona(persona) {
    const personaKey = `${persona.gender}_${persona.age}_${persona.closeness}_${persona.priceRange}`;
    const existing = await db.select().from(preGeneratedProducts).where(eq(preGeneratedProducts.personaKey, personaKey));
    if (existing.length > 0) {
      return existing;
    }
    const products = [];
    for (let i = 0; i < 3; i++) {
      try {
        const product = await generateProductRecommendation(persona);
        const explanations = await generateExplanations(persona, product);
        const [savedProduct] = await db.insert(preGeneratedProducts).values({
          personaKey,
          productIndex: i,
          productName: product.name,
          productPrice: product.price,
          productFeatures: product.features,
          productDescription: product.description,
          productImageUrl: product.imageUrl,
          explanations
        }).returning();
        products.push(savedProduct);
      } catch (error) {
        console.error(`Failed to generate product ${i} for persona ${personaKey}:`, error);
      }
    }
    return products;
  }
  // Get next pre-generated product for persona
  async getNextPreGeneratedProduct(personaKey, currentIndex) {
    const nextIndex = currentIndex + 1;
    if (nextIndex > 2) {
      return void 0;
    }
    const [product] = await db.select().from(preGeneratedProducts).where(
      and(
        eq(preGeneratedProducts.personaKey, personaKey),
        eq(preGeneratedProducts.productIndex, nextIndex)
      )
    );
    return product || void 0;
  }
};
var storage = new DatabaseStorage();

// server/types/session.ts
import "express-session";

// server/routes.ts
async function registerRoutes(app2) {
  app2.post("/api/recommendations/product", async (req, res) => {
    try {
      const persona = friendPersonaSchema.parse(req.body);
      const product = await generateProductRecommendation(persona);
      res.json(product);
    } catch (error) {
      res.status(400).json({ message: error.message || "\uC0C1\uD488 \uCD94\uCC9C \uC0DD\uC131 \uC2E4\uD328" });
    }
  });
  app2.post("/api/recommendations/explanations", async (req, res) => {
    try {
      const { persona, product } = req.body;
      const validatedPersona = friendPersonaSchema.parse(persona);
      const validatedProduct = productSchema.parse(product);
      const explanations = await generateExplanations(validatedPersona, validatedProduct);
      res.json(explanations);
    } catch (error) {
      res.status(400).json({ message: error.message || "\uC124\uBA85 \uC0DD\uC131 \uC2E4\uD328" });
    }
  });
  app2.post("/api/recommendations/regenerate-product", async (req, res) => {
    try {
      const persona = friendPersonaSchema.parse(req.body);
      const newProduct = await generateProductRecommendation(persona);
      const explanations = await generateExplanations(persona, newProduct);
      res.json({
        product: newProduct,
        explanations
      });
    } catch (error) {
      res.status(400).json({ message: error.message || "\uC81C\uD488 \uC7AC\uCD94\uCC9C \uC2E4\uD328" });
    }
  });
  app2.post("/api/recommendations/regenerate-explanations", async (req, res) => {
    try {
      const { persona, product } = req.body;
      const validatedPersona = friendPersonaSchema.parse(persona);
      const validatedProduct = productSchema.parse(product);
      const explanations = await generateExplanations(validatedPersona, validatedProduct);
      res.json(explanations);
    } catch (error) {
      res.status(400).json({ message: error.message || "\uC124\uBA85 \uC7AC\uC0DD\uC131 \uC2E4\uD328" });
    }
  });
  app2.post("/api/recommendations/next-product", async (req, res) => {
    try {
      const { persona, currentIndex } = req.body;
      const validatedPersona = friendPersonaSchema.parse(persona);
      const personaKey = `${validatedPersona.gender}_${validatedPersona.age}_${validatedPersona.closeness}_${validatedPersona.priceRange}`;
      const nextProduct = await storage.getNextPreGeneratedProduct(personaKey, currentIndex || 0);
      if (!nextProduct) {
        return res.status(404).json({ message: "\uB354 \uC774\uC0C1 \uCD94\uCC9C\uD560 \uC81C\uD488\uC774 \uC5C6\uC2B5\uB2C8\uB2E4" });
      }
      res.json(nextProduct);
    } catch (error) {
      res.status(400).json({ message: error.message || "\uC81C\uD488 \uC870\uD68C \uC2E4\uD328" });
    }
  });
  app2.post("/api/recommendations/pre-generate", async (req, res) => {
    try {
      const persona = friendPersonaSchema.parse(req.body);
      const products = await storage.preGenerateProductsForPersona(persona);
      res.json({ message: "\uC81C\uD488 \uBBF8\uB9AC \uC0DD\uC131 \uC644\uB8CC", count: products.length });
    } catch (error) {
      res.status(400).json({ message: error.message || "\uC81C\uD488 \uBBF8\uB9AC \uC0DD\uC131 \uC2E4\uD328" });
    }
  });
  app2.post("/api/recommendations", async (req, res) => {
    try {
      const recommendation = await storage.createRecommendation(req.body);
      res.json(recommendation);
    } catch (error) {
      res.status(400).json({ message: error.message || "\uCD94\uCC9C \uC800\uC7A5 \uC2E4\uD328" });
    }
  });
  app2.patch("/api/recommendations/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updated = await storage.updateRecommendation(id, req.body);
      if (!updated) {
        return res.status(404).json({ message: "\uCD94\uCC9C\uC744 \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4" });
      }
      res.json(updated);
    } catch (error) {
      res.status(400).json({ message: error.message || "\uCD94\uCC9C \uC5C5\uB370\uC774\uD2B8 \uC2E4\uD328" });
    }
  });
  app2.post("/api/share-message", async (req, res) => {
    try {
      const { persona, product, explanation } = req.body;
      const validatedPersona = friendPersonaSchema.parse(persona);
      const validatedProduct = productSchema.parse(product);
      const message = await generateShareMessage(validatedPersona, validatedProduct, explanation);
      res.json({ message });
    } catch (error) {
      res.status(400).json({ message: error.message || "\uACF5\uC720 \uBA54\uC2DC\uC9C0 \uC0DD\uC131 \uC2E4\uD328" });
    }
  });
  app2.get("/api/recommendations", async (req, res) => {
    try {
      const recommendations2 = await storage.getAllRecommendations();
      res.json(recommendations2);
    } catch (error) {
      res.status(500).json({ message: error.message || "\uCD94\uCC9C \uBAA9\uB85D \uC870\uD68C \uC2E4\uD328" });
    }
  });
  app2.post("/api/survey-responses", async (req, res) => {
    try {
      const validatedData = surveyResponseSchema.parse(req.body);
      console.log("Survey Response Received:", {
        id: validatedData.recommendationId,
        selectedType: validatedData.selectedExplanationType,
        responses: validatedData.surveyResponses,
        timestamp: validatedData.submittedAt
      });
      res.json({ message: "\uC124\uBB38 \uC751\uB2F5\uC774 \uC800\uC7A5\uB418\uC5C8\uC2B5\uB2C8\uB2E4.", id: validatedData.recommendationId });
    } catch (error) {
      console.error("Survey submission error:", error);
      res.status(400).json({ message: error.message || "\uC124\uBB38 \uC81C\uCD9C \uC2E4\uD328" });
    }
  });
  app2.post("/api/experiment/start", async (req, res) => {
    try {
      const persona = friendPersonaSchema.parse(req.body);
      const product = await generateProductRecommendation(persona);
      const explanations = await generateExplanations(persona, product);
      console.log("\u{1F3A8} Generating DALL-E image before showing explanations...");
      const imageUrl = await generateProductImage(product.name, product.description);
      const productWithImage = {
        ...product,
        imageUrl
      };
      console.log("\u2705 Image generation completed, proceeding with experiment...");
      const LATIN_SQUARE_ORDERS = [
        ["featureFocused", "profileBased", "contextBased"],
        // A→B→C
        ["featureFocused", "contextBased", "profileBased"],
        // A→C→B  
        ["profileBased", "featureFocused", "contextBased"],
        // B→A→C
        ["profileBased", "contextBased", "featureFocused"],
        // B→C→A
        ["contextBased", "featureFocused", "profileBased"],
        // C→A→B
        ["contextBased", "profileBased", "featureFocused"]
        // C→B→A
      ];
      const orderIndex = Math.floor(Math.random() * LATIN_SQUARE_ORDERS.length);
      const shuffledOrder = LATIN_SQUARE_ORDERS[orderIndex];
      const session2 = {
        id: Date.now().toString(),
        persona,
        product: productWithImage,
        explanations: {
          featureFocused: explanations.featureFocused,
          profileBased: explanations.profileBased,
          contextBased: explanations.contextBased
        },
        order: shuffledOrder,
        currentStep: 0,
        responses: [],
        completed: false,
        startedAt: Date.now()
      };
      const experimentData = {
        id: session2.id,
        friendName: persona.name,
        friendAge: persona.age,
        gender: persona.gender,
        relationship: persona.relationship,
        occasion: persona.occasion,
        closeness: persona.closeness,
        priceRange: persona.priceRange,
        emotionalState: persona.emotionalState,
        productName: productWithImage.name,
        productPrice: productWithImage.price,
        productFeatures: productWithImage.features,
        productDescription: productWithImage.description,
        productImageUrl: productWithImage.imageUrl,
        explanations: {
          featureFocused: explanations.featureFocused,
          profileBased: explanations.profileBased,
          contextBased: explanations.contextBased
        },
        experimentOrder: shuffledOrder,
        responses: [],
        finalChoice: null,
        startedAt: /* @__PURE__ */ new Date(),
        completedAt: null
      };
      console.log("\u{1F4BE} Attempting to save experiment data:", JSON.stringify(experimentData, null, 2));
      const savedExperiment = await storage.createExperiment(experimentData);
      console.log("\u2705 Experiment saved to database:", savedExperiment.id);
      req.session.experimentSession = session2;
      res.json(session2);
    } catch (error) {
      console.error("\u274C Experiment creation failed:", error);
      console.error("\u274C Full error details:", JSON.stringify(error, null, 2));
      res.status(400).json({ message: error.message || "\uC2E4\uD5D8 \uC138\uC158 \uC0DD\uC131 \uC2E4\uD328" });
    }
  });
  app2.post("/api/experiment/response", async (req, res) => {
    try {
      const response = req.body;
      if (req.session.experimentSession) {
        req.session.experimentSession.responses.push(response);
        req.session.experimentSession.currentStep += 1;
      }
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ message: error.message || "\uC751\uB2F5 \uC800\uC7A5 \uC2E4\uD328" });
    }
  });
  app2.post("/api/experiment/complete", async (req, res) => {
    try {
      const { finalChoice } = req.body;
      if (req.session.experimentSession) {
        req.session.experimentSession.completed = true;
        req.session.experimentSession.finalChoice = finalChoice;
        const session2 = req.session.experimentSession;
        const experimentData = {
          id: session2.id,
          friendName: session2.persona.name,
          friendAge: session2.persona.age,
          gender: session2.persona.gender,
          relationship: session2.persona.relationship,
          occasion: session2.persona.occasion,
          priceRange: session2.persona.priceRange,
          emotionalState: session2.persona.emotionalState,
          productName: session2.product.name,
          productPrice: session2.product.price,
          productFeatures: session2.product.features,
          productDescription: session2.product.description,
          productImageUrl: session2.product.imageUrl,
          explanations: session2.explanations,
          experimentOrder: session2.order,
          responses: session2.responses,
          finalChoice,
          startedAt: new Date(session2.startedAt),
          completedAt: /* @__PURE__ */ new Date()
        };
        const updatedExperiment = await storage.updateExperiment(session2.id, {
          responses: session2.responses,
          finalChoice,
          completedAt: /* @__PURE__ */ new Date()
        });
        console.log("Experiment updated in database:", updatedExperiment?.id);
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error saving experiment:", error);
      res.status(400).json({ message: error.message || "\uC2E4\uD5D8 \uC644\uB8CC \uCC98\uB9AC \uC2E4\uD328" });
    }
  });
  app2.get("/api/experiment/session", async (req, res) => {
    try {
      const session2 = req.session.experimentSession;
      if (!session2) {
        return res.status(404).json({ message: "\uD65C\uC131 \uC2E4\uD5D8 \uC138\uC158\uC774 \uC5C6\uC2B5\uB2C8\uB2E4" });
      }
      res.json(session2);
    } catch (error) {
      res.status(400).json({ message: error.message || "\uC138\uC158 \uC870\uD68C \uC2E4\uD328" });
    }
  });
  app2.get("/api/experiment/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const experiment = await storage.getExperiment(id);
      if (!experiment) {
        return res.status(404).json({ message: "\uC2E4\uD5D8\uC744 \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4" });
      }
      const sessionFormat = {
        id: experiment.id,
        persona: {
          name: experiment.friendName,
          age: experiment.friendAge,
          gender: experiment.gender,
          relationship: experiment.relationship,
          occasion: experiment.occasion,
          priceRange: experiment.priceRange,
          emotionalState: experiment.emotionalState
        },
        product: {
          name: experiment.productName,
          price: experiment.productPrice,
          features: experiment.productFeatures,
          description: experiment.productDescription,
          imageUrl: experiment.productImageUrl
        },
        explanations: experiment.explanations,
        order: experiment.experimentOrder,
        responses: experiment.responses,
        completed: !!experiment.completedAt,
        startedAt: experiment.startedAt.getTime(),
        finalChoice: experiment.finalChoice
      };
      res.json(sessionFormat);
    } catch (error) {
      res.status(400).json({ message: error.message || "\uC2E4\uD5D8 \uB370\uC774\uD130 \uC870\uD68C \uC2E4\uD328" });
    }
  });
  app2.get("/api/experiments", async (req, res) => {
    try {
      const experiments2 = await storage.getAllExperiments();
      res.json(experiments2);
    } catch (error) {
      res.status(400).json({ message: error.message || "\uC2E4\uD5D8 \uB370\uC774\uD130 \uC870\uD68C \uC2E4\uD328" });
    }
  });
  app2.get("/api/experiments/:id", async (req, res) => {
    try {
      const experiment = await storage.getExperiment(req.params.id);
      if (!experiment) {
        return res.status(404).json({ message: "\uC2E4\uD5D8\uC744 \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4" });
      }
      res.json(experiment);
    } catch (error) {
      res.status(400).json({ message: error.message || "\uC2E4\uD5D8 \uC870\uD68C \uC2E4\uD328" });
    }
  });
  app2.get("/api/prompt-templates", (req, res) => {
    try {
      const templates = getPromptTemplates();
      res.json(templates);
    } catch (error) {
      console.error("Prompt templates retrieval error:", error);
      res.status(500).json({ message: "\uD504\uB86C\uD504\uD2B8 \uD15C\uD50C\uB9BF \uC870\uD68C\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4." });
    }
  });
  app2.post("/api/behavior/event", async (req, res) => {
    try {
      const event = insertBehaviorEventSchema.parse(req.body);
      const saved = await storage.saveBehaviorEvent(event);
      res.json(saved);
    } catch (error) {
      res.status(400).json({ message: error.message || "\uD589\uB3D9 \uC774\uBCA4\uD2B8 \uC800\uC7A5 \uC2E4\uD328" });
    }
  });
  app2.post("/api/behavior/metrics", async (req, res) => {
    try {
      const metrics = insertBehaviorMetricsSchema.parse(req.body);
      const saved = await storage.saveBehaviorMetrics(metrics);
      res.json(saved);
    } catch (error) {
      res.status(400).json({ message: error.message || "\uD589\uB3D9 \uBA54\uD2B8\uB9AD \uC800\uC7A5 \uC2E4\uD328" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use(session({
  secret: process.env.SESSION_SECRET || "fallback-secret-key-for-development",
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: false,
    // set to true if using HTTPS
    maxAge: 24 * 60 * 60 * 1e3
    // 24 hours
  }
}));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
