export default `// Sum of integers from 1 to 3
@i
M=1         // i = 1
@sum
M=0         // sum = 0
(LOOP)
  @i
  D=M       // D = i
  @3
  D=D-A     // D = i - 3
  @END
  D;JGT     // If (i - 3) > 0, goto END
  @i
  D=M       // D = i
  @sum
  M=D+M     // sum = sum + i
  @i
  M=M+1     // i = i + 1
  @LOOP
  0;JMP     // goto LOOP
(END)
  @END
  0;JMP     // Infinite loop
`;
