import * as os from 'os'
import * as util from 'util'
import * as toolCache from '@actions/tool-cache'
import * as core from '@actions/core'
import * as path from 'path'
import * as fs from 'fs'
import {exec} from '@actions/exec'

export function getKubectlArch(): string {
   const arch = os.arch()
   if (arch === 'x64') {
      return 'amd64'
   }
   return arch
}

export function getkubectlDownloadURL(version: string, arch: string): string {
   switch (os.type()) {
      case 'Linux':
         return `https://dl.k8s.io/release/${version}/bin/linux/${arch}/kubectl`

      case 'Darwin':
         return `https://dl.k8s.io/release/${version}/bin/darwin/${arch}/kubectl`

      case 'Windows_NT':
      default:
         return `https://dl.k8s.io/release/${version}/bin/windows/${arch}/kubectl.exe`
   }
}

export function getExecutableExtension(): string {
   if (os.type().match(/^Win/)) {
      return '.exe'
   }
   return ''
}

export function newTemporaryFile(prefix: string): string {
   const directory = process.env['RUNNER_TEMP'] || ''
   return path.join(directory, `${prefix}_${Date.now()}`)
}

export function storeKubeConfig(kubeConfig: string): void {
   const kubeConfigPath = newTemporaryFile('kubeconfig')
   core.debug(`Writing kubeconfig contents to ${kubeConfigPath}`)
   fs.writeFileSync(kubeConfigPath, kubeConfig)
   core.exportVariable('KUBECONFIG', kubeConfigPath)
}

export function getKubeConfig(): string {
   const config = core.getInput('config', {required: true})
   return Buffer.from(config, 'base64').toString('utf-8')
}

export async function validateKubeConfig(): Promise<void> {
   try {
      await exec('kubectl', ['config', 'current-context'], {silent: true})
   } catch (e) {
      throw new Error(
         'kubeconfig is not a valid base64 encoded kubernetes config'
      )
   }
}
