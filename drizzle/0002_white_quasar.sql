CREATE INDEX "mvp_votes_night_id_idx" ON "mvp_votes" USING btree ("night_id");--> statement-breakpoint
CREATE INDEX "participants_night_id_idx" ON "poker_night_participants" USING btree ("night_id");--> statement-breakpoint
CREATE INDEX "results_night_id_idx" ON "poker_night_results" USING btree ("night_id");--> statement-breakpoint
CREATE INDEX "results_user_id_idx" ON "poker_night_results" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "poker_nights_group_status_idx" ON "poker_nights" USING btree ("group_id","status");