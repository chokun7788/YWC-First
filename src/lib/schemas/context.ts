import { z } from "zod";

export const idSchema = z.string().trim().regex(/^[a-zA-Z0-9][a-zA-Z0-9._-]*$/);
export const trainingTypeSchema = z.enum(["regular", "field"]);
export const studyYearSchema = z.union([z.literal(1), z.literal(2), z.literal(3)]);
export const academicYearSchema = z.number().int().min(2400).max(3000);
export const uniformSchema = z.enum(["male_uniform", "female_uniform"]);
export const trainingContextSchema = z.strictObject({
  centerId: idSchema.nullable(), locationId: idSchema.nullable(),
  trainingType: trainingTypeSchema.nullable(), studyYear: studyYearSchema.nullable(),
  academicYearBE: academicYearSchema.nullable(),
  uniformGroup: z.enum(["male_uniform", "female_uniform", "unspecified"]),
});
const dimension = <T extends z.ZodType>(schema: T) => z.union([z.literal("*"), z.array(schema)]);
export const scopeSchema = z.strictObject({
  centerIds: dimension(idSchema), locationIds: dimension(idSchema),
  trainingTypes: dimension(trainingTypeSchema), studyYears: dimension(studyYearSchema),
  academicYearsBE: dimension(academicYearSchema), uniformGroups: dimension(uniformSchema),
});
export type TrainingContext = z.infer<typeof trainingContextSchema>;
export type Scope = z.infer<typeof scopeSchema>;
export type ContextField = keyof TrainingContext;
export const emptyContext: TrainingContext = {
  centerId: null, locationId: null, trainingType: null, studyYear: null,
  academicYearBE: null, uniformGroup: "unspecified",
};
