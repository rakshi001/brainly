export function random(len: number) {
  let options = 'iueshflaehbflasibdfnpewiurhfs83974832y4328y';
  let length = options.length;
  let ans = '';
  for (let i = 0; i < len; i++) {
    ans += options[Math.floor(Math.random() * length)];
  }
  return ans;
}
