import { ReminderKind, ReminderTemplate } from "@/types/reminder";

type ReminderTemplateMap = Record<ReminderKind, ReminderTemplate[]>;

export const REMINDER_TEMPLATES: ReminderTemplateMap = {
  collect: [
    {
      description: "{name} still owes you {amount}. Have you tried turning the friendship off and on again?",
      caption: "Tech Support for Your Wallet",
    },
    {
      description: "Knock knock. Who's there? {amount}. {amount} who? {amount} that {name} still hasn't paid you, that's who.",
      caption: "We're Not Laughing Either",
    },
    {
      description: "{name} owes you {amount}. We're not saying they're avoiding you… but they just changed their name and moved countries.",
      caption: "Suspicious Activity Detected",
    },
    {
      description: "Why did {name} cross the road? To get away from paying you {amount}. Classic {name}.",
      caption: "We See You, {name}",
    },
    {
      description: "{name} still hasn't paid {amount}. At this rate, it's basically a donation. A very unwilling donation.",
      caption: "Charity Case",
    },
    {
      description: "Reminder: {name} owes you {amount}. This message will self-destruct. {name}'s excuse won't though.",
      caption: "Excuses Are Renewable. Money Isn't.",
    },
    {
      description: "{name} with your {amount} is like a wifi password — you know it exists, you just can't get to it.",
      caption: "Connection Failed",
    },
    {
      description: "PSA: {name} still owes you {amount}. We'd say sleep on it, but you've been doing that for a while now.",
      caption: "Wake Up Call",
    },
    {
      description: "{name} owes you {amount}. We checked their LinkedIn. They're doing fine. Just saying.",
      caption: "LinkedIn Investigation Complete",
    },
    {
      description: "Friendly reminder that {name} has your {amount}. Less friendly reminder coming soon.",
      caption: "Warning: Level 2 Incoming",
    },
    {
      description: "{name} still hasn't paid {amount}. We've entered the 'awkward silence at dinner' phase.",
      caption: "Dinner Is Uncomfortable Now",
    },
    {
      description: "Your {amount} called. It said it misses you and it's cold at {name}'s place.",
      caption: "Missing: One {amount}",
    },
    {
      description: "{name} owes you {amount}. At this point, charge interest. Emotional interest.",
      caption: "New Revenue Stream Unlocked",
    },
    {
      description: "Breaking: local person {name} still hasn't returned {amount}. Sources describe the situation as 'a choice'.",
      caption: "Developing Story",
    },
    {
      description: "Send {name} a reminder. Or don't. Watch the {amount} evaporate into thin air. Your call.",
      caption: "Choose Your Destiny",
    },
    {
      description: "{name} owes you {amount}. You've been patient. You've been kind. You've been a pushover. Change that.",
      caption: "Character Arc Complete",
    },
    {
      description: "It's been a while since {name} paid you {amount}. Glaciers have moved faster. Significantly faster.",
      caption: "Geological Update",
    },
    {
      description: "{name} still has your {amount}. We're not mad. We're just deeply, deeply disappointed.",
      caption: "Parental Tone Activated",
    },
    {
      description: "Fun activity: text {name} about the {amount} they owe you. Watch the read receipts. Watch them not reply.",
      caption: "Entertainment for One",
    },
    {
      description: "{name} owes you {amount}. Their excuse has been loading for weeks. Must be on 2G.",
      caption: "Buffering… Still Buffering",
    },
    {
      description: "Somewhere out there, {name} is living their best life with your {amount}. Isn't that something.",
      caption: "A Villain Origin Story",
    },
    {
      description: "{name} still owes {amount}. We consulted a psychic. They said 'it's not looking good.'",
      caption: "Psychic Report Filed",
    },
    {
      description: "Your {amount} is on an extended vacation at {name}'s wallet. No return date confirmed.",
      caption: "Vacation Mode: Indefinite",
    },
    {
      description: "{name} has owed you {amount} so long it deserves its own anniversary.",
      caption: "Happy Debt-iversary 🎉",
    },
    {
      description: "Plot twist: {name} forgot about the {amount}. Remind them. Loudly.",
      caption: "Spoiler Alert",
    },
    {
      description: "{name} owes you {amount}. A gentle nudge today. A passive-aggressive meme tomorrow.",
      caption: "Escalation Schedule",
    },
    {
      description: "We've done the math. {name} still owes you {amount}. The math is very upset.",
      caption: "Math Has Feelings Too",
    },
    {
      description: "{name} is out here living rent-free in your head AND keeping your {amount}. Evict both.",
      caption: "Double Eviction Notice",
    },
    {
      description: "Ping {name}. Recover {amount}. Treat yourself. In that order.",
      caption: "Step-by-Step Guide",
    },
    {
      description: "{name} still owes you {amount}. This is reminder #whatever. You've lost count. So have we.",
      caption: "We've All Lost Count",
    },
    {
      description: "Sources close to {name} confirm they do, in fact, have money. And yet. {amount}. Unpaid.",
      caption: "Investigative Journalism",
    },
    {
      description: "{name} still has your {amount}. At this point you're their unofficial bank. Charge fees.",
      caption: "Unauthorized Banking",
    },
    {
      description: "If {name} were a movie, they'd be called 'Gone with the {amount}'.",
      caption: "Now Showing",
    },
    {
      description: "{name} owes you {amount}. History will not be kind to them. Neither will your next text.",
      caption: "History in the Making",
    },
    {
      description: "Today is a great day for {name} to pay you {amount}. Statistically, they won't. Prove statistics wrong.",
      caption: "Beat the Odds",
    },
    {
      description: "{name} still owes {amount}. We checked. The money is real. The repayment is not.",
      caption: "Fact Check: Failed",
    },
    {
      description: "Your {amount} has been at {name}'s for so long it pays rent there now.",
      caption: "Property Law Is Complicated",
    },
    {
      description: "{name} owes you {amount}. Not to be dramatic but this could be the start of a grudge. Act now.",
      caption: "Grudge Prevention Hotline",
    },
    {
      description: "A wise person once said: get your money back from {name}. That wise person was us. Just now.",
      caption: "Ancient Wisdom",
    },
    {
      description: "{name} still hasn't paid {amount}. In the time you've waited, you could've grown a tomato plant.",
      caption: "Time You'll Never Get Back",
    },
    {
      description: "Alert: your {amount} was last seen entering {name}'s wallet. It has not been seen since.",
      caption: "Missing Persons Report",
    },
    {
      description: "{name} owes you {amount}. You could let it go. You could also not let it go. We recommend not.",
      caption: "Professional Advice",
    },
    {
      description: "{name} still has your {amount}. Science says holding grudges is bad for health. Collecting debts is fine though.",
      caption: "Medically Endorsed",
    },
    {
      description: "It costs zero dollars to remind {name} they owe you {amount}. Very cost-effective.",
      caption: "Best ROI of Your Day",
    },
    {
      description: "{name} owes you {amount}. Their horoscope says today is a great day to pay debts. Show them this.",
      caption: "The Stars Have Spoken",
    },
    {
      description: "Every 60 seconds, {name} still owes you {amount}. A minute passes. Nothing changes. Text them.",
      caption: "Fun Fact About Time",
    },
    {
      description: "{name} and your {amount} are in a long-term relationship now. Break them up.",
      caption: "Unofficial Couple",
    },
    {
      description: "{name} still owes {amount}. You have the moral high ground. Now go collect it.",
      caption: "Seize the High Ground",
    },
    {
      description: "Reminder that {name} has {amount} of yours. Also reminder that you have a voice. Use it.",
      caption: "Use Your Words",
    },
    {
      description: "{name} has owed you {amount} through seasons, holidays, and at least one birthday. Enough.",
      caption: "Time's Up",
    },
  ],
  repay: [
    {
      description: "You owe {name} {amount}. Your wallet is heavy with guilt. And also excuses.",
      caption: "Put Down the Excuses",
    },
    {
      description: "Paying back {name} {amount} won't hurt. We promise. Okay we can't promise. But do it anyway.",
      caption: "Rip the Bandaid",
    },
    {
      description: "You still owe {name} {amount}. Your bank account is ready. Your excuses are not invited.",
      caption: "Excuses Stay Home",
    },
    {
      description: "I owe {name} {amount}… said you, hopefully, out loud, to yourself, right now. Great start.",
      caption: "Step 1 Complete",
    },
    {
      description: "Every second you don't pay {name} {amount}, somewhere an accountant sheds a single tear.",
      caption: "Think of the Accountants",
    },
    {
      description: "If procrastination burned calories, you'd be shredded by now. Pay {name} {amount} today.",
      caption: "No More Reps",
    },
    {
      description: "Rumor has it people who repay debts on time live longer. Science. Look it up. Don't look it up.",
      caption: "100% Real Statistic",
    },
    {
      description: "You and {name} had something beautiful. Then you owed them {amount}. Rekindle it. Pay up.",
      caption: "Romance is Dead. Debts Aren't.",
    },
    {
      description: "You owe {name} {amount}. Your conscience is filing a formal complaint. HR is involved.",
      caption: "HR Has Been Notified",
    },
    {
      description: "Paying {name} {amount} today would make you, objectively, a better person. We ran the numbers.",
      caption: "Data-Driven Self-Improvement",
    },
    {
      description: "You owe {name} {amount}. We believe in you. {name} is starting to believe less.",
      caption: "Belief Gap Widening",
    },
    {
      description: "Just a heads up: the longer you owe {name} {amount}, the louder your inner guilt monologue gets.",
      caption: "Brain Volume: Increasing",
    },
    {
      description: "You still owe {name} {amount}. Somewhere in a parallel universe, you already paid. Be that you.",
      caption: "Multiverse Shaming",
    },
    {
      description: "Paying {name} {amount} unlocks a rare power: being able to look them in the eye again.",
      caption: "Rare Ability Acquired",
    },
    {
      description: "You owe {name} {amount}. It's not a big deal. It's actually a medium deal. Pay it.",
      caption: "Medium Deal Alert",
    },
    {
      description: "Today's to-do list: breathe, exist, pay {name} {amount}, breathe again.",
      caption: "Simple Enough",
    },
    {
      description: "You owe {name} {amount}. The awkward tension at hangouts has a price. That price is {amount}.",
      caption: "Cost of Awkwardness",
    },
    {
      description: "Repaying {name} {amount} takes less time than reading this notification. Yet here we are.",
      caption: "Irony Noted",
    },
    {
      description: "You still owe {name} {amount}. We're not saying you're a villain. We're just not NOT saying it.",
      caption: "Villain Check",
    },
    {
      description: "Fun idea: pay {name} {amount} and experience the ancient joy of having zero debt. Feels good, apparently.",
      caption: "Allegedly Feels Amazing",
    },
    {
      description: "You owe {name} {amount}. The universe has a ledger. It is not balanced. Fix it.",
      caption: "Cosmic Audit In Progress",
    },
    {
      description: "Plot twist: you pay {name} {amount} and they're shocked. Be the plot twist.",
      caption: "Be the Plot Twist",
    },
    {
      description: "Paying {name} {amount} is honestly great cardio for your thumbs. Open the app. Do it.",
      caption: "Thumb Day",
    },
    {
      description: "You owe {name} {amount}. This is your reminder, your sign, your prophecy. Pay up.",
      caption: "This Is The Sign",
    },
    {
      description: "People who owe {amount} to {name} and don't pay are statistically 100% of people reading this.",
      caption: "You Are the Statistic",
    },
    {
      description: "Your debt to {name} is {amount}. Your excuse collection is priceless. One of these must go.",
      caption: "Spring Cleaning",
    },
    {
      description: "You owe {name} {amount}. Somewhere they're smiling and pretending it's fine. It's not fine.",
      caption: "It Is Not Fine",
    },
    {
      description: "Quick sum: you + {amount} - debt to {name} = a functioning adult. Show your work.",
      caption: "Basic Math",
    },
    {
      description: "You still owe {name} {amount}. We checked your schedule. You're free. You've always been free.",
      caption: "Calendar Checked",
    },
    {
      description: "Paying {name} {amount} today will not solve all your problems. But it solves this one. Start somewhere.",
      caption: "One Problem at a Time",
    },
    {
      description: "You owe {name} {amount}. Sleep is for people with clear consciences. Just saying.",
      caption: "Sleep Report: Poor",
    },
    {
      description: "Every day you owe {name} {amount} is a day they write about in their journal. Unfavorably.",
      caption: "You're a Chapter Now",
    },
    {
      description: "Repaying {name} {amount} is the main character move you've been avoiding. The arc demands it.",
      caption: "Narrative Pressure",
    },
    {
      description: "You owe {name} {amount}. Not to alarm you, but they remember. They always remember.",
      caption: "They Remember",
    },
    {
      description: "New life hack: pay {name} {amount} and stop doing mental gymnastics every time you see them.",
      caption: "Life Hack #1",
    },
    {
      description: "You owe {name} {amount}. We've drafted your eulogy. 'They meant to pay it back' doesn't land well.",
      caption: "Eulogy Review: Needs Work",
    },
    {
      description: "Paying {name} back {amount} is technically legal, morally good, and socially excellent. No downsides.",
      caption: "Zero Cons. We Checked.",
    },
    {
      description: "You owe {name} {amount}. Time is a flat circle. This notification will come back. So will the debt.",
      caption: "Philosophy Hour",
    },
    {
      description: "You still owe {name} {amount}. The audacity to not have paid yet is, frankly, impressive.",
      caption: "Backhanded Compliment",
    },
    {
      description: "Gentle threat: pay {name} {amount} or we'll tell your future self you had the money and didn't.",
      caption: "Time Traveler's Warning",
    },
    {
      description: "You owe {name} {amount}. The economy is bad. Their patience is worse. Act accordingly.",
      caption: "Market Conditions: Critical",
    },
    {
      description: "Historians will note that on this day, you still owed {name} {amount} and did nothing about it.",
      caption: "Historical Record Updated",
    },
    {
      description: "You owe {name} {amount}. Your dog knows. Your dog is also disappointed.",
      caption: "The Dog Knows",
    },
    {
      description: "Technically you could pay {name} {amount} right now. Technically. We checked your excuses. They're weak.",
      caption: "Excuses Reviewed: Rejected",
    },
    {
      description: "You owe {name} {amount}. We're not here to judge. We are exactly here to judge. Pay it.",
      caption: "Judgment Day (Minor)",
    },
    {
      description: "One small payment to {name}, one giant leap for your reputation. {amount}. That's it.",
      caption: "Neil Armstrong Wouldn't Owe {name}",
    },
    {
      description: "You owe {name} {amount}. Real talk: they need it. Less real talk: we will not stop reminding you.",
      caption: "Real Talk Mode",
    },
    {
      description: "Your debt to {name} is {amount}. It's not aging like fine wine. It's aging like leftovers. Handle it.",
      caption: "Expiry Date: Yesterday",
    },
    {
      description: "You owe {name} {amount}. This notification is awkward for all of us. Make it stop. Pay them.",
      caption: "Mutually Awkward",
    },
    {
      description: "Studies show that paying {name} {amount} increases serotonin, improves posture, and ends this notification streak.",
      caption: "Doctor's Orders (Fake Doctor)",
    },
  ],
};