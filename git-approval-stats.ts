import { exec } from "child_process";

const command = `cd ${process.argv[2]}; git log master | awk '/Approved-by/ {print}' | awk -F'<' '{ for(i = 2 ; i <= NF ; i++) { sub(/>.*/, "", $i); print $i; } } '`;

const execute = (command, callback) => {
  exec(command, function(error, stdout, stderr) {
    callback(stdout);
  });
};

execute(command, (emailList: string) => {
  const emails = emailList.split("\n");

  const lookup = new Map<string, number>();

  emails.forEach(email => {
    if (!email) {
      return;
    }

    if (lookup.has(email)) {
      const currentNumber = lookup.get(email);
      lookup.set(email, currentNumber + 1);
    } else {
      lookup.set(email, 1);
    }
  });

  const sortingArray = [];

  lookup.forEach((value, key) =>
    sortingArray.push({ author: key, stat: value })
  );

  const sorted = sortingArray
    .sort((a, b) => (a.stat > b.stat ? 1 : -1))
    .reverse();

  console.log("Your top 10 reviewers are:");

  for (let i = 0; i < 10; i++) {
    console.log(
      `  ${i + 1}. ${sorted[i].author} (${sorted[i].stat} approvals)`
    );
  }
});
