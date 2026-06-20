-- Custom SQL migration file, put your code below! --
UPDATE users_table SET amount = ROUND(amount, 2);
UPDATE iou_transactions SET amount = ROUND(amount, 2);
