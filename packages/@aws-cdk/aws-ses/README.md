## Amazon Simple Email Service Construct Library
This module is part of the [AWS Cloud Development Kit](https://github.com/awslabs/aws-cdk) project.

### Email receiving
Create a receipt rule set with rules and actions:
[example of setting up a receipt rule set](test/example.receiving.lit.ts)

Alternatively, rules can be added to a rule set:
```ts
const ruleSet = new ses.ReceiptRuleSet(this, 'RuleSet'):

const awsRule = ruleSet.addRule('Aws', {
  recipients: ['aws.com']
});
```

And actions to rules:
```ts
awsRule.addAction(
  new ses.ReceiptRuleSnsAction({
    topic
  });
);
```
When using `addRule`, the new rule is added after the last added rule unless `after` is specified.

[More actions](test/integ.receipt.ts)

#### Drop spams
A rule to drop spam can be added by setting `dropSpam` to `true`:

```ts
new ses.ReceiptRuleSet(this, 'RuleSet', {
  dropSpam: true
});
```

This will add a rule at the top of the rule set with a Lambda action that stops processing messages that have at least one spam indicator. See [Lambda Function Examples](https://docs.aws.amazon.com/ses/latest/DeveloperGuide/receiving-email-action-lambda-example-functions.html).


### Receipt filter
Create a receipt filter:
```ts
new ses.ReceiptFilter(this, 'Filter', {
  ip: '1.2.3.4/16' // Will be blocked
})
```

A white list filter is also available:
```ts
new ses.WhiteListReceiptFilter(this, 'WhiteList', {
  ips: [
    '10.0.0.0/16',
    '1.2.3.4/16',
  ]
});
```
This will first create a block all filter and then create allow filters for the listed ip addresses.
