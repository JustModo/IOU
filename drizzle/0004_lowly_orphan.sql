-- Custom SQL migration file, put your code below! --
CREATE TRIGGER update_user_amount_after_insert 
AFTER INSERT ON iou_transactions
FOR EACH ROW BEGIN
    UPDATE users_table
    SET amount = (
        SELECT SUM(amount)
        FROM iou_transactions
        WHERE user_id = NEW.user_id
    )
    WHERE id = NEW.user_id;
END;
--> statement-breakpoint
CREATE TRIGGER update_user_amount_after_delete
AFTER DELETE ON iou_transactions
FOR EACH ROW BEGIN
    UPDATE users_table
    SET amount = (
        SELECT COALESCE(SUM(amount), 0)
        FROM iou_transactions
        WHERE user_id = OLD.user_id
    )
    WHERE id = OLD.user_id;
END;
--> statement-breakpoint
CREATE TRIGGER update_user_amount_after_update
AFTER UPDATE ON iou_transactions
FOR EACH ROW BEGIN
    UPDATE users_table
    SET amount = (
        SELECT COALESCE(SUM(amount), 0)
        FROM iou_transactions
        WHERE user_id = OLD.user_id
    )
    WHERE id = OLD.user_id;
END;