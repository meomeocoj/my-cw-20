import codegen from "@cosmwasm/ts-codegen"


codegen({
  contracts: [
    {
      name: "CW20",
      dir: "../cw20-base/schema"
    },
  ],
  outPath: "./",
  options: {
    bundle: {
      bundleFile: 'index.ts',
      scope: 'contracts'
    },
    types: {
      enabled: true
    },
    client: {
      enabled: true
    },
    reactQuery: {
      enabled: true,
      optionalClient: true,
      version: 'v4',
      mutations: true,
      queryKeys: true,
      queryFactory: true,
    },
    recoil: {
      enabled: false
    },
    messageComposer: {
      enabled: false
    }
  }
}).then(() => {
  console.log("all done!")
})


