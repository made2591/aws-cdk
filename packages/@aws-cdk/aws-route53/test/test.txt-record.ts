import { exactlyMatchTemplate, expect } from '@aws-cdk/assert';
import { App, Stack } from '@aws-cdk/cdk';
import { Test } from 'nodeunit';
import { PublicHostedZone, TxtRecord } from '../lib';

export = {
  'TXT records': {
    TXT(test: Test) {
      const app = new TestApp();
      const zone = new PublicHostedZone(app.stack, 'HostedZone', { zoneName: 'test.public' });
      new TxtRecord(zone, 'TXT', { zone, recordName: '_foo', recordValue: 'Bar!' });
      expect(app.stack).to(exactlyMatchTemplate({
        Resources: {
          HostedZoneDB99F866: {
            Type: 'AWS::Route53::HostedZone',
            Properties: {
              Name: 'test.public.'
            }
          },
          HostedZoneTXT69C29760: {
            Type: 'AWS::Route53::RecordSet',
            Properties: {
              HostedZoneId: {
              Ref: 'HostedZoneDB99F866'
              },
              Name: '_foo.test.public.',
              ResourceRecords: ['"Bar!"'],
              Type: 'TXT',
              TTL: '1800'
            }
            }
        }
      }));
      test.done();
    }
  }
};

class TestApp {
  public readonly stack: Stack;
  private readonly app = new App();

  constructor() {
    const account = '123456789012';
    const region = 'bermuda-triangle';
    this.app.node.setContext(`availability-zones:${account}:${region}`,
              [`${region}-1a`]);
    this.stack = new Stack(this.app, 'MyStack', { env: { account, region } });
  }
}
