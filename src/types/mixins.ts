/*
 https://stackoverflow.com/questions/64396668/why-do-typescript-mixins-require-a-constructor-with-a-single-rest-parameter-any

 https://www.typescriptlang.org/play?#code/C4TwDgpgBAsglgDzgOwEIEMDO0C8VkQDuUAFAHQXoBOA5pgFxTrIgDaAugJRQ4B8TLANwAoYaEhQA4hGAAFKgHswmADwAVDNn54NWaBATAIyACaZ8RUmEXLGKAGYQqUWdz4CQUAPwuojAgBuTmLg0NLAAJLImMDMAMYQ6poQ2lC62FAGRqbmBMTklLQMHhxu-A5OUBHeVX4WQVQhEjBONBAAwsAKVCoAggA0UKipeVY2xeHySqq9-ABkUjJTyirDZYuR0bHICX3zG1Ex8YnDosIA9OdQAKqY6G30F1cARuBY5sAAFtBUEDFUcDiwDgCmQAhMUAAtswAK7oAA28M84mgX2gmDgNGQ6GAMN+wnsMJ2wNBiwUkJkVBA8CQyCSekyhmMZlgiBQyV4JGSjHSEG4AG9hFAoJcoABrCCeACMjHeTmAQwZWA8UC6UJhRlV3zSAGVMlRFI1hXFQTEoAARJxwIIQvBxeHvMkU4BUxnZFlcpXmZggAVC4VQTCfdCQRgAcl+QOYNHhEDDUAAPlAwy64NHY2H-cbTS6YUDuiRrNNGPzA8HQ8nI9sY3HE8nU+nawBfP0BgOYGGQKiF8acLMBr5wTBkIMh3BQIvKEfliD9pv++f+0USzwAJkY0OQcMRnjiWAVKNVCigz2gLVoHS6Rqgv1xVDBloBNqY5nPbU63RUKIU9gtVptgy8rwwiLvajoAKLIMCoBQIKwrYhSjD-CgND+iaWxUHmV49sWsH4OgiGBqmyA0FALawf2g7Dgh46TtRBGzsK86gTmTqUp4eDSOS7E0igJCQdBvrCOhZptOSPAWMQXHOlSJCljR4b2AoCjPNQYaDKOFYRhAUYkRmZF9iJCixmQ8IKDQJBiZCZA0YMVnTmOfaiEAA
*/

type GetProps<TBase> = TBase extends new (props: infer P) => any ? P : never;
type GetInstance<TBase> = TBase extends new (...args: any[]) => infer I
    ? I
    : never;

export type Constructor = new (...args: any[]) => any;
// eslint-disable-next-line @typescript-eslint/ban-types
export type GConstructor<T = {}> = new (...args: any[]) => T;
export type MergeCtor<A, B> = new (
    props: GetProps<A> & GetProps<B>
) => GetInstance<A> & GetInstance<B>;
