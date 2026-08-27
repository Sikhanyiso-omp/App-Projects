-- Keep the earliest copy if an older deployment was seeded concurrently before
-- the uniqueness rule existed, then make all future seed inserts conflict-safe.
DELETE FROM `questions`
WHERE `id` NOT IN (
	SELECT MIN(`id`) FROM `questions` GROUP BY `module_id`, `prompt`
);
--> statement-breakpoint
CREATE UNIQUE INDEX `questions_module_prompt_idx` ON `questions` (`module_id`,`prompt`);
