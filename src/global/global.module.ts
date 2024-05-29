import * as path from 'path';
import { Global, Module } from '@nestjs/common';

import { ConfigService } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';

////////////////////////////////////////////////
////////////// Config //////////////////////////
////////////////////////////////////////////////
let emailTransport: any;
if (process.env.PROD === 'true') {
  console.log('PROD'); 
  emailTransport = {
   // SES: new AWS.SES(),
    secure: true,
    ignoreTLS: true,
    debug: false,
  };
} else {
  console.log('TEST'); 
  
  emailTransport = {
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
      auth: {
        user: "cd77fd23ac2372",
        pass: "bf86298ae33419"
      }
    },
  };
}

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
@Global()
@Module({
  providers: [

  ],
  imports: [
    MailerModule.forRootAsync({
      useFactory: async (config: ConfigService) => ({
        transport: emailTransport,
        defaults: { 
          from: `"${process.env.APP_NAME} Support" <kiran@gmail.com}>`,
        },
        template: {
          dir: path.resolve(__dirname, '../', 'emails').replace('dist','src'),
          adapter: new HandlebarsAdapter(
            {},
            {
              inlineCssEnabled: true,
              // inlineCssOptions: {
              //   url: ' ',
              //   preserveMediaQueries: true, 
              // },
            },
          ),
          options: {
            strict: true,
          },
        },
        preview:true,
        options: {
          // partials: true,
          partials: {
            dir: path.resolve(__dirname, '../../', 'emails/partials'),
            options: {
              strict: true,
            },
          },
        },
      }),
    }),
  ],
  exports: [MailerModule],
})
export class GlobalModule {}
